import {
  DialogContent,
  FormControlLabel,
  IconButton,
  Link,
  ListItemText,
  Switch,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid2";
import { useSnackbar } from "notistack";
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Viewer, ViewerType } from "../../../../../api/explorer.ts";
import { builtInViewers } from "../../../../../redux/thunks/viewer.ts";
import { isTrueVal } from "../../../../../session/utils.ts";
import CircularProgress from "../../../../Common/CircularProgress.tsx";
import SizeInput from "../../../../Common/SizeInput.tsx";
import { DefaultCloseAction } from "../../../../Common/Snackbar/snackbar.tsx";
import {
  DenseFilledTextField,
  DenseSelect,
  NoWrapTableCell,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../../Common/StyledComponents.tsx";
import DraggableDialog from "../../../../Dialogs/DraggableDialog.tsx";
import { SquareMenuItem } from "../../../../FileManager/ContextMenu/ContextMenu.tsx";
import { ViewerIDWithDefaultIcons } from "../../../../FileManager/Dialogs/OpenWith.tsx";
import Add from "../../../../Icons/Add.tsx";
import Dismiss from "../../../../Icons/Dismiss.tsx";
import SettingForm from "../../../../Pages/Setting/SettingForm.tsx";
import MagicVarDialog, { MagicVar } from "../../../Common/MagicVarDialog.tsx";
import { NoMarginHelperText } from "../../Settings.tsx";

const MonacoEditor = lazy(() => import("../../../../Viewers/CodeViewer/MonacoEditor.tsx"));

export interface FileViewerEditDialogProps {
  viewer: Viewer;
  onChange: (viewer: Viewer) => void;
  open: boolean;
  onClose: () => void;
}

const magicVars: MagicVar[] = [
  {
    name: "{$src}",
    value: "settings.srcEncodedVar",
    example: "https%3A%2F%2Fcloudreve.org%2Fapi%2Fv4%2Ffile%2Fcontent%2FzOie%2F0%2Ftext.txt%3Fsign%3Dxxx",
  },
  {
    name: "{$src_raw}",
    value: "settings.srcVar",
    example: "https://cloudreve.org/api/v4/file/content/zOie/0/text.txt?sign=xxx",
  },
  {
    name: "{$name}",
    value: "settings.nameEncodedVar",
    example: "sampleFile%5B1%5D.txt",
  },
  {
    name: "{$version}",
    value: "settings.versionEntityVar",
    example: "zOie",
  },
  {
    name: "{$id}",
    value: "settings.fileIdVar",
    example: "jm8AF8",
  },
  {
    name: "{$user_id}",
    value: "settings.userIdVar",
    example: "lpua",
  },
  {
    name: "{$user_display_name}",
    value: "settings.userDisplayNameVar",
    example: "Aaron%20Liu",
  },
];

const FileViewerEditDialog = ({ viewer, onChange, open, onClose }: FileViewerEditDialogProps) => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [viewerShadowed, setViewerShadowed] = useState<Viewer | undefined>(undefined);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [magicVarOpen, setMagicVarOpen] = useState(false);
  const [wopiCached, setWopiCached] = useState("");
  const withDefaultIcon = useMemo(() => {
    return ViewerIDWithDefaultIcons.includes(viewer.id);
  }, [viewer.id]);

  useEffect(() => {
    setViewerShadowed({ ...viewer });
    setWopiCached("");
  }, [viewer, setWopiCached, setViewerShadowed]);

  const onSubmit = useCallback(() => {
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    let changed = viewerShadowed;
    if (!viewerShadowed || !changed) {
      return;
    }

    if (wopiCached != "") {
      try {
        const parsed = JSON.parse(wopiCached);
        changed = { ...viewerShadowed, wopi_actions: parsed };
        setViewerShadowed({ ...changed });
      } catch (e) {
        enqueueSnackbar({
          message: t("settings.invalidWopiActionMapping"),
          variant: "warning",
          action: DefaultCloseAction,
        });
        return;
      }
    }

    onChange(changed);
    onClose();
  }, [viewerShadowed, wopiCached, formRef]);

  const openMagicVar = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setMagicVarOpen(true);
    e.stopPropagation();
    e.preventDefault();
  }, []);

  if (!viewerShadowed) {
    return null;
  }

  return (
    <DraggableDialog
      title={t("settings.editViewerTitle", {
        name: t(viewer.display_name, { ns: "application" }),
      })}
      showActions
      showCancel
      onAccept={onSubmit}
      dialogProps={{
        fullWidth: true,
        maxWidth: "lg",
        open,
        onClose,
      }}
    >
      <DialogContent>
        <MagicVarDialog open={magicVarOpen} vars={magicVars} onClose={() => setMagicVarOpen(false)} />
        <form ref={formRef}>
          <Grid spacing={2} container>
            <SettingForm noContainer lgWidth={6} title={t("settings.iconUrl")}>
              <DenseFilledTextField
                fullWidth
                required={!withDefaultIcon}
                value={viewerShadowed.icon}
                onChange={(e) => {
                  setViewerShadowed((v) => ({
                    ...(v as Viewer),
                    icon: e.target.value,
                  }));
                }}
              />
              {withDefaultIcon && <NoMarginHelperText>{t("settings.builtInIconUrlDes")}</NoMarginHelperText>}
            </SettingForm>
            <SettingForm noContainer lgWidth={6} title={t("settings.displayName")}>
              <DenseFilledTextField
                fullWidth
                required
                value={viewerShadowed.display_name}
                onChange={(e) => {
                  setViewerShadowed((v) => ({
                    ...(v as Viewer),
                    display_name: e.target.value,
                  }));
                }}
              />
              <NoMarginHelperText>{t("settings.displayNameDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm noContainer lgWidth={6} title={t("settings.exts")}>
              <DenseFilledTextField
                fullWidth
                multiline
                required
                value={viewerShadowed.exts.join()}
                onChange={(e) =>
                  setViewerShadowed((v) => ({
                    ...(v as Viewer),
                    exts: e.target.value.split(",").map((ext) => ext.trim()),
                  }))
                }
              />
            </SettingForm>
            {viewer.type == ViewerType.custom && (
              <SettingForm noContainer lgWidth={6} title={t("settings.viewerUrl")}>
                <DenseFilledTextField
                  fullWidth
                  required
                  value={viewerShadowed.url}
                  onChange={(e) =>
                    setViewerShadowed((v) => ({
                      ...(v as Viewer),
                      url: e.target.value,
                    }))
                  }
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey={"settings.viewerUrlDes"}
                    ns={"dashboard"}
                    components={[<Link onClick={openMagicVar} href={"#"} />]}
                  />
                </NoMarginHelperText>
              </SettingForm>
            )}
            <SettingForm noContainer lgWidth={6} title={t("settings.maxSize")}>
              <FormControl fullWidth>
                <SizeInput
                  variant={"outlined"}
                  required
                  allowZero={true}
                  value={viewerShadowed.max_size ?? 0}
                  onChange={(e) =>
                    setViewerShadowed((v) => ({
                      ...(v as Viewer),
                      max_size: e ? e : undefined,
                    }))
                  }
                />
                <NoMarginHelperText>{t("settings.maxSizeDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            {viewer.type == ViewerType.custom && (
              <SettingForm noContainer lgWidth={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTrueVal(viewerShadowed.props?.openInNew ?? "")}
                      onChange={(e) =>
                        setViewerShadowed((v) => ({
                          ...(v as Viewer),
                          props: {
                            ...(v?.props ?? {}),
                            openInNew: e.target.checked.toString(),
                          },
                        }))
                      }
                    />
                  }
                  label={t("settings.openInNew")}
                />
                <NoMarginHelperText>{t("settings.openInNewDes")}</NoMarginHelperText>
              </SettingForm>
            )}
            {viewer.id == builtInViewers.drawio && (
              <SettingForm noContainer title={t("settings.drawioHost")} lgWidth={6}>
                <DenseFilledTextField
                  fullWidth
                  required
                  value={viewerShadowed.props?.host ?? ""}
                  onChange={(e) =>
                    setViewerShadowed((v) => ({
                      ...(v as Viewer),
                      props: {
                        ...(v?.props ?? {}),
                        host: e.target.value,
                      },
                    }))
                  }
                />
                <NoMarginHelperText>{t("settings.drawioHostDes")}</NoMarginHelperText>
              </SettingForm>
            )}
            {viewer.type == ViewerType.wopi && (
              <SettingForm noContainer title={t("settings.woapiActionMapping")} lgWidth={12}>
                <Suspense fallback={<CircularProgress />}>
                  <MonacoEditor
                    theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
                    value={wopiCached == "" ? JSON.stringify(viewerShadowed.wopi_actions, null, 4) : wopiCached}
                    height={"300px"}
                    minHeight={"300px"}
                    language={"json"}
                    onChange={(e) => setWopiCached(e as string)}
                  />
                </Suspense>
              </SettingForm>
            )}
            <SettingForm noContainer title={t("settings.newFileAction")} lgWidth={12}>
              {viewerShadowed?.templates && viewerShadowed.templates.length > 0 && (
                <TableContainer sx={{ mt: 1, maxHeight: 440 }} component={StyledTableContainerPaper}>
                  <Table
                    stickyHeader
                    sx={{
                      width: "100%",
                      maxHeight: 300,
                      tableLayout: "fixed",
                    }}
                    size="small"
                  >
                    <TableHead>
                      <TableRow>
                        <NoWrapTableCell width={100}>{t("settings.ext")}</NoWrapTableCell>
                        <NoWrapTableCell width={200}>{t("settings.displayName")}</NoWrapTableCell>
                        <NoWrapTableCell width={64}></NoWrapTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewerShadowed.templates?.map((t, i) => (
                        <TableRow
                          key={i}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                          hover
                        >
                          <NoWrapTableCell>
                            <DenseSelect
                              value={t.ext}
                              required
                              onChange={(e) => {
                                const newExt = e.target.value as string;
                                setViewerShadowed((v) => ({
                                  ...(v as Viewer),
                                  templates: (v?.templates ?? []).map((template, index) =>
                                    index == i ? { ...template, ext: newExt } : template,
                                  ),
                                }));
                              }}
                            >
                              {viewerShadowed.exts.map((ext) => (
                                <SquareMenuItem value={ext}>
                                  <ListItemText
                                    slotProps={{
                                      primary: {
                                        variant: "body2",
                                      },
                                    }}
                                  >
                                    {ext}
                                  </ListItemText>
                                </SquareMenuItem>
                              ))}
                            </DenseSelect>
                          </NoWrapTableCell>
                          <NoWrapTableCell>
                            <DenseFilledTextField
                              fullWidth
                              required
                              value={t.display_name}
                              onChange={(e) => {
                                setViewerShadowed((v) => ({
                                  ...(v as Viewer),
                                  templates: (v?.templates ?? []).map((template, index) =>
                                    index == i
                                      ? {
                                          ...template,
                                          display_name: e.target.value,
                                        }
                                      : template,
                                  ),
                                }));
                              }}
                            />
                          </NoWrapTableCell>
                          <NoWrapTableCell>
                            <IconButton
                              size={"small"}
                              onClick={() =>
                                setViewerShadowed((v) => ({
                                  ...(v as Viewer),
                                  templates: (v?.templates ?? []).filter((_, index) => index != i),
                                }))
                              }
                            >
                              <Dismiss fontSize={"small"} />
                            </IconButton>
                          </NoWrapTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <SecondaryButton
                sx={{ mt: 1 }}
                variant={"contained"}
                startIcon={<Add />}
                onClick={() =>
                  setViewerShadowed((v) => ({
                    ...(v as Viewer),
                    templates: [...(v?.templates ?? []), { ext: viewerShadowed.exts?.[0] ?? "", display_name: "" }],
                  }))
                }
              >
                {t("settings.addNewFileAction")}
              </SecondaryButton>
              <NoMarginHelperText>{t("settings.newFileActionDes")}</NoMarginHelperText>
            </SettingForm>
          </Grid>
        </form>
      </DialogContent>
    </DraggableDialog>
  );
};

export default FileViewerEditDialog;
