import { getUniqueTagsFromFiles, Tag as TagItem } from "../Dialogs/Tags.tsx";
import { FileResponse, Metadata } from "../../../api/explorer.ts";
import React, { useCallback, useContext, useState } from "react";
import { CascadingContext, CascadingMenuItem } from "./CascadingMenu.tsx";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { closeContextMenu } from "../../../redux/fileManagerSlice.ts";
import { setTagsDialog } from "../../../redux/globalStateSlice.ts";
import { ListItemIcon, ListItemText } from "@mui/material";
import Tags from "../../Icons/Tags.tsx";
import { DenseDivider, SquareMenuItem, SubMenuItemsProps } from "./ContextMenu.tsx";
import SessionManager, { UserSettings } from "../../../session";
import { UsedTags } from "../../../session/utils.ts";
import Checkmark from "../../Icons/Checkmark.tsx";
import FileTag from "../Explorer/FileTag.tsx";
import { patchFileMetadata } from "../../../redux/thunks/file.ts";
import { FileManagerIndex } from "../FileManager.tsx";

interface TagOption extends TagItem {
  selected?: boolean;
}

const getTagOptions = (targets: FileResponse[]): TagOption[] => {
  const tags: {
    [key: string]: TagOption;
  } = {};
  getUniqueTagsFromFiles(targets).forEach((tag) => {
    tags[tag.key] = { ...tag, selected: true };
  });

  const existing = SessionManager.get(UserSettings.UsedTags) as UsedTags;
  if (existing) {
    Object.keys(existing).forEach((key) => {
      if (!tags[key]) {
        tags[key] = { key, color: existing[key] ?? undefined, selected: false };
      }
    });
  }

  return Object.values(tags);
};

const TagMenuItems = ({ displayOpt, targets }: SubMenuItemsProps) => {
  const { rootPopupState } = useContext(CascadingContext);
  const [tags, setTags] = useState<TagOption[]>(getTagOptions(targets));
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const onClick = useCallback(
    (f: () => any) => () => {
      f();
      if (rootPopupState) {
        rootPopupState.close();
      }
      dispatch(
        closeContextMenu({
          index: 0,
          value: undefined,
        }),
      );
    },
    [dispatch, targets],
  );

  const onTagChange = useCallback(
    async (tag: TagOption, selected: boolean) => {
      setTags((tags) =>
        tags.map((t) => {
          if (t.key == tag.key) {
            return { ...t, selected };
          }
          return t;
        }),
      );
      try {
        await dispatch(
          patchFileMetadata(FileManagerIndex.main, targets, [
            {
              key: Metadata.tag_prefix + tag.key,
              value: tag.color,
              remove: !selected,
            },
          ]),
        );
      } catch (e) {
        return;
      }
    },
    [targets, setTags],
  );

  return (
    <>
      <CascadingMenuItem
        onClick={onClick(() =>
          dispatch(
            setTagsDialog({
              open: true,
              file: targets,
            }),
          ),
        )}
      >
        <ListItemIcon>
          <Tags fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("application:modals.manageTags")}</ListItemText>
      </CascadingMenuItem>
      {tags.length > 0 && <DenseDivider />}
      {tags.map((tag) => (
        <SquareMenuItem key={tag.key} onClick={() => onTagChange(tag, !tag.selected)}>
          {tag.selected && (
            <>
              <ListItemIcon>
                <Checkmark />
              </ListItemIcon>
              <ListItemText>
                <FileTag disableClick spacing={1} label={tag.key} tagColor={tag.color} />
              </ListItemText>
            </>
          )}
          {!tag.selected && (
            <ListItemText inset>
              <FileTag disableClick spacing={1} label={tag.key} tagColor={tag.color} />
            </ListItemText>
          )}
        </SquareMenuItem>
      ))}
    </>
  );
};

export default TagMenuItems;
