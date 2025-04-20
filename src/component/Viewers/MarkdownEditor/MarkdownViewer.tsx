import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import ViewerDialog, { ViewerLoading } from "../ViewerDialog.tsx";
import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { closeMarkdownViewer } from "../../../redux/globalStateSlice.ts";
import {
  Box,
  Button,
  ButtonGroup,
  ListItemText,
  Menu,
  useTheme,
} from "@mui/material";
import useActionDisplayOpt, {
  canUpdate,
} from "../../FileManager/ContextMenu/useActionDisplayOpt.ts";
import CaretDown from "../../Icons/CaretDown.tsx";
import { SquareMenuItem } from "../../FileManager/ContextMenu/ContextMenu.tsx";
import { getEntityContent } from "../../../redux/thunks/file.ts";
import { saveMarkdown } from "../../../redux/thunks/viewer.ts";
import { LoadingButton } from "@mui/lab";

const MarkdownEditor = lazy(() => import("./Editor.tsx"));

const MarkdownViewer = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const viewerState = useAppSelector(
    (state) => state.globalState.markdownViewer,
  );

  const displayOpt = useActionDisplayOpt(
    viewerState?.file ? [viewerState?.file] : [],
  );
  const supportUpdate = canUpdate(displayOpt);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [changedValue, setChangedValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [optionAnchorEl, setOptionAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const loadContent = useCallback(() => {
    if (!viewerState || !viewerState.open) {
      return;
    }

    setLoaded(false);
    setOptionAnchorEl(null);
    dispatch(getEntityContent(viewerState.file, viewerState.version))
      .then((res) => {
        const content = new TextDecoder().decode(res);
        setValue(content);
        setChangedValue(content);
        setLoaded(true);
      })
      .catch(() => {
        onClose();
      });
  }, [viewerState]);

  useEffect(() => {
    if (!viewerState || !viewerState.open) {
      return;
    }

    setSaved(true);
    loadContent();
  }, [viewerState?.open]);

  const onClose = useCallback(() => {
    dispatch(closeMarkdownViewer());
  }, [dispatch]);

  const openMore = useCallback(
    (e: React.MouseEvent<any>) => {
      setAnchorEl(e.currentTarget);
    },
    [dispatch],
  );

  const onSave = useCallback(
    (saveAs?: boolean) => {
      if (!viewerState?.file) {
        return;
      }

      setLoading(true);
      dispatch(
        saveMarkdown(
          changedValue,
          viewerState.file,
          viewerState.version,
          saveAs,
        ),
      )
        .then(() => {
          setSaved(true);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [changedValue, viewerState],
  );

  const onChange = useCallback((v: string) => {
    setChangedValue(v);
    setSaved(false);
  }, []);

  return (
    <ViewerDialog
      file={viewerState?.file}
      loading={loading}
      readOnly={!supportUpdate}
      actions={
        <Box sx={{ display: "flex", gap: 1 }}>
          {supportUpdate && (
            <ButtonGroup
              disabled={loading || !loaded || saved}
              disableElevation
              variant="contained"
            >
              <LoadingButton
                loading={loading}
                variant={"contained"}
                onClick={() => onSave(false)}
              >
                <span>{t("fileManager.save")}</span>
              </LoadingButton>
              <Button size="small" onClick={openMore}>
                <CaretDown sx={{ fontSize: "12px!important" }} />
              </Button>
            </ButtonGroup>
          )}
        </Box>
      }
      fullScreenToggle
      dialogProps={{
        open: !!(viewerState && viewerState.open),
        onClose: onClose,
        fullWidth: true,
        maxWidth: "lg",
      }}
    >
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              minWidth: 150,
            },
          },
        }}
      >
        <SquareMenuItem onClick={() => onSave(true)} dense>
          <ListItemText>{t("modals.saveAs")}</ListItemText>
        </SquareMenuItem>
      </Menu>
      {!loaded && <ViewerLoading />}
      {loaded && (
        <Suspense fallback={<ViewerLoading />}>
          <MarkdownEditor
            value={changedValue}
            readOnly={!supportUpdate}
            darkMode={theme.palette.mode === "dark"}
            initialValue={value}
            onChange={(v) => onChange(v as string)}
          />
        </Suspense>
      )}
    </ViewerDialog>
  );
};

export default MarkdownViewer;
