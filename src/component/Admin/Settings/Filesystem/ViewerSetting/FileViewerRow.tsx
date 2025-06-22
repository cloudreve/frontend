import * as React from "react";
import { memo, useCallback, useState } from "react";
import { Viewer, ViewerType } from "../../../../../api/explorer.ts";
import { useTranslation } from "react-i18next";
import { IconButton, TableRow } from "@mui/material";
import { DenseFilledTextField, NoWrapCell, StyledCheckbox } from "../../../../Common/StyledComponents.tsx";
import { ViewerIcon } from "../../../../FileManager/Dialogs/OpenWith.tsx";
import Dismiss from "../../../../Icons/Dismiss.tsx";
import Edit from "../../../../Icons/Edit.tsx";
import FileViewerEditDialog from "./FileViewerEditDialog.tsx";

export interface FileViewerRowProps {
  viewer: Viewer;
  onChange: (viewer: Viewer) => void;
  onDelete: (e: React.MouseEvent<HTMLElement>) => void;
}

const FileViewerRow = memo(({ viewer, onChange, onDelete }: FileViewerRowProps) => {
  const { t } = useTranslation("dashboard");
  const [extCached, setExtCached] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const onClose = useCallback(() => {
    setEditOpen(false);
  }, [setEditOpen]);
  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} hover>
      <FileViewerEditDialog viewer={viewer} onChange={onChange} open={editOpen} onClose={onClose} />
      <NoWrapCell>
        <ViewerIcon viewer={viewer} />
      </NoWrapCell>
      <NoWrapCell>{t(`settings.${viewer.type}ViewerType`)}</NoWrapCell>
      <NoWrapCell>
        {t(viewer.display_name, {
          ns: "application",
        })}
      </NoWrapCell>
      <NoWrapCell>
        <DenseFilledTextField
          fullWidth
          multiline
          required
          value={extCached == "" ? viewer.exts.join() : extCached}
          onBlur={() => {
            onChange({
              ...viewer,
              exts: extCached == "" ? viewer.exts : extCached?.split(",")?.map((ext) => ext.trim()),
            });
            setExtCached("");
          }}
          onChange={(e) => setExtCached(e.target.value)}
        />
      </NoWrapCell>
      <NoWrapCell>
        {viewer.templates?.length ? t("settings.nMapping", { num: viewer.templates?.length }) : t("share.none")}
      </NoWrapCell>
      <NoWrapCell>
        <StyledCheckbox
          size={"small"}
          checked={!viewer.disabled}
          onChange={(e) =>
            onChange({
              ...viewer,
              disabled: !e.target.checked,
            })
          }
        />
      </NoWrapCell>
      <NoWrapCell>
        <IconButton size={"small"} onClick={() => setEditOpen(true)}>
          <Edit fontSize={"small"} />
        </IconButton>
        {viewer.type != ViewerType.builtin && (
          <IconButton size={"small"} onClick={onDelete}>
            <Dismiss fontSize={"small"} />
          </IconButton>
        )}
      </NoWrapCell>
    </TableRow>
  );
});

export default FileViewerRow;
