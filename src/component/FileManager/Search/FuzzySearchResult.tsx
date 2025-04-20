import { FileResponse, FileType, Metadata } from "../../../api/explorer.ts";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { sizeToString } from "../../../util";
import FileIcon from "../Explorer/FileIcon.tsx";
import React, { useCallback } from "react";
import FileBadge from "../FileBadge.tsx";
import CrUri from "../../../util/uri.ts";
// @ts-ignore
import Highlighter from "react-highlight-words";

import { openFileContextMenu } from "../../../redux/thunks/file.ts";
import { FileManagerIndex } from "../FileManager.tsx";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { ContextMenuTypes } from "../../../redux/fileManagerSlice.ts";

export interface FuzzySearchResultProps {
  files: FileResponse[];
  keyword: string;
}

const FuzzySearchResult = ({ files, keyword }: FuzzySearchResultProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const getFileTypeText = useCallback(
    (file: FileResponse) => {
      if (file.metadata?.[Metadata.share_redirect]) {
        return t("fileManager.symbolicFile");
      }

      if (file.type == FileType.folder) {
        return t("application:fileManager.folder");
      }
      return sizeToString(file.size);
    },
    [t],
  );

  return (
    <List sx={{ width: "100%", px: 1 }} dense>
      {files.map((file) => (
        <ListItem disablePadding dense>
          <ListItemButton
            sx={{ py: 0 }}
            onClick={(e) =>
              dispatch(
                openFileContextMenu(
                  FileManagerIndex.main,
                  file,
                  true,
                  e,
                  ContextMenuTypes.searchResult,
                ),
              )
            }
          >
            <ListItemAvatar sx={{ minWidth: 48 }}>
              <FileIcon
                variant={"default"}
                file={file}
                sx={{ p: 0 }}
                iconProps={{
                  sx: {
                    fontSize: "24px",
                    height: "32px",
                    width: "32px",
                  },
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Highlighter
                  highlightClassName="highlight-marker"
                  searchWords={keyword.split(" ")}
                  autoEscape={true}
                  textToHighlight={file.name}
                />
              }
              secondary={getFileTypeText(file)}
              slotProps={{
                primary: {
                  variant: "body2",
                },

                secondary: {
                  variant: "body2",
                }
              }} />
            <FileBadge
              clickable
              variant={"outlined"}
              sx={{ px: 1, mt: "2px" }}
              simplifiedFile={{
                path: new CrUri(file.path).parent().toString(),
                type: FileType.folder,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default FuzzySearchResult;
