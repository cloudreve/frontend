import {
  DialogContent,
  FormControl,
  Grid2,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { sendExtractArchive } from "../../../api/api.ts";
import { closeExtractArchiveDialog } from "../../../redux/globalStateSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { fileExtension, getFileLinkedUri } from "../../../util";
import { FileDisplayForm } from "../../Common/Form/FileDisplayForm.tsx";
import { PathSelectorForm } from "../../Common/Form/PathSelectorForm.tsx";
import { ViewTaskAction } from "../../Common/Snackbar/snackbar.tsx";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import Password from "../../Icons/Password.tsx";
import Translate from "../../Icons/Translate.tsx";
import { FileManagerIndex } from "../FileManager.tsx";

const encodings = [
  "ibm866",
  "iso8859_2",
  "iso8859_3",
  "iso8859_4",
  "iso8859_5",
  "iso8859_6",
  "iso8859_7",
  "iso8859_8",
  "iso8859_8I",
  "iso8859_10",
  "iso8859_13",
  "iso8859_14",
  "iso8859_15",
  "iso8859_16",
  "koi8r",
  "koi8u",
  "macintosh",
  "windows874",
  "windows1250",
  "windows1251",
  "windows1252",
  "windows1253",
  "windows1254",
  "windows1255",
  "windows1256",
  "windows1257",
  "windows1258",
  "macintoshcyrillic",
  "gbk",
  "gb18030",
  "big5",
  "eucjp",
  "iso2022jp",
  "shiftjis",
  "euckr",
  "utf16be",
  "utf16le",
];

const defaultEncodingValue = " ";

const ExtractArchive = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState("");
  const [encoding, setEncoding] = useState(defaultEncodingValue);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const open = useAppSelector((state) => state.globalState.extractArchiveDialogOpen);
  const target = useAppSelector((state) => state.globalState.extractArchiveDialogFile);
  const current = useAppSelector((state) => state.fileManager[FileManagerIndex.main].pure_path);
  const mask = useAppSelector((state) => state.globalState.extractArchiveDialogMask);

  const showEncodingOption = useMemo(() => {
    const ext = fileExtension(target?.name ?? "");
    return ext === "zip";
  }, [target?.name]);

  const showPasswordOption = useMemo(() => {
    const ext = fileExtension(target?.name ?? "");
    return ext === "zip" || ext === "7z";
  }, [target?.name]);

  useEffect(() => {
    if (open) {
      setPath(current ?? "");
    }
  }, [open]);

  const onClose = useCallback(() => {
    dispatch(closeExtractArchiveDialog());
  }, [dispatch]);

  const onAccept = useCallback(() => {
    if (!target) {
      return;
    }

    setLoading(true);
    dispatch(
      sendExtractArchive({
        src: [getFileLinkedUri(target)],
        dst: path,
        encoding: showEncodingOption && encoding != defaultEncodingValue ? encoding : undefined,
        password: showPasswordOption && password ? password : undefined,
        file_mask: mask ?? undefined,
      }),
    )
      .then(() => {
        dispatch(closeExtractArchiveDialog());
        enqueueSnackbar({
          message: t("modals.taskCreated"),
          variant: "success",
          action: ViewTaskAction(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [target, encoding, path, showPasswordOption, showEncodingOption, password, mask]);

  return (
    <DraggableDialog
      title={t("application:fileManager.extractArchive")}
      showActions
      loading={loading}
      showCancel
      onAccept={onAccept}
      dialogProps={{
        open: open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "sm",
        disableRestoreFocus: true,
      }}
    >
      <DialogContent sx={{ pt: 1 }}>
        <Grid2 container spacing={3}>
          {target && (
            <Grid2
              size={{
                xs: 12,
                md: showEncodingOption ? 6 : 12,
              }}
            >
              <FileDisplayForm file={target} label={t("modals.archiveFile")} />
            </Grid2>
          )}
          {showEncodingOption && (
            <Grid2
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControl variant="outlined" fullWidth>
                <InputLabel>{t("modals.selectEncoding")}</InputLabel>
                <Select
                  variant="outlined"
                  startAdornment={
                    !isMobile && (
                      <InputAdornment position="start">
                        <Translate />
                      </InputAdornment>
                    )
                  }
                  label={t("modals.selectEncoding")}
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                >
                  <MenuItem value={defaultEncodingValue}>
                    <em>{t("modals.defaultEncoding")}</em>
                  </MenuItem>
                  {encodings.map((enc) => (
                    <MenuItem key={enc} value={enc}>
                      {enc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          )}
          <Grid2
            size={{
              xs: 12,
            }}
          >
            <PathSelectorForm onChange={setPath} path={path} variant={"extractTo"} label={t("modals.decompressTo")} />
          </Grid2>
          {showPasswordOption && (
            <Grid2
              size={{
                xs: 12,
              }}
            >
              <TextField
                slotProps={{
                  input: {
                    startAdornment: !isMobile && (
                      <InputAdornment position="start">
                        <Password />
                      </InputAdornment>
                    ),
                  },
                }}
                fullWidth
                placeholder={t("application:modals.passwordDescription")}
                label={t("modals.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid2>
          )}
        </Grid2>
      </DialogContent>
    </DraggableDialog>
  );
};
export default ExtractArchive;
