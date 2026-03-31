import { Box, Button, IconButton, LinearProgress, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { closeSnackbar, SnackbarKey } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileResponse } from "../../../api/explorer.ts";
import { Response } from "../../../api/request.ts";
import {
  BatchDownloadProgress,
  setBatchDownloadLogDialog,
  setShareReadmeOpen,
} from "../../../redux/globalStateSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { showAggregatedErrorDialog } from "../../../redux/thunks/dialog.ts";
import { cancelSignals } from "../../../redux/thunks/download.ts";
import { navigateToPath } from "../../../redux/thunks/filemanager.ts";
import { FileManagerIndex } from "../../FileManager/FileManager.tsx";

export const DefaultCloseAction = (snackbarId: SnackbarKey | undefined) => {
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => closeSnackbar(snackbarId)} color="inherit" size="small">
        {t("dismiss", { ns: "common" })}
      </Button>
    </>
  );
};

export const ErrorListDetailAction = (error: Response<any>) => (snackbarId: SnackbarKey | undefined) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const Close = DefaultCloseAction(snackbarId);

  const showDetails = useCallback(() => {
    dispatch(showAggregatedErrorDialog(error));
    closeSnackbar(snackbarId);
  }, [dispatch, error, snackbarId]);

  return (
    <>
      <Button onClick={showDetails} color="inherit" size="small">
        {t("common:errorDetails")}
      </Button>
      {Close}
    </>
  );
};

export const OpenReadMeAction = (file: FileResponse) => (snackbarId: SnackbarKey | undefined) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const Close = DefaultCloseAction(snackbarId);

  const openReadMe = useCallback(() => {
    dispatch(setShareReadmeOpen({ open: true, target: file }));
    closeSnackbar(snackbarId);
  }, [dispatch, file, snackbarId]);

  return (
    <>
      <Button onClick={openReadMe} color="inherit" size="small">
        {t("application:modals.view")}
      </Button>
      {Close}
    </>
  );
};

export const ViewDstAction = (dst: string) => (snackbarId: SnackbarKey | undefined) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const Close = DefaultCloseAction(snackbarId);

  const viewDst = useCallback(() => {
    dispatch(navigateToPath(FileManagerIndex.main, dst));
    closeSnackbar(snackbarId);
  }, [dispatch, snackbarId]);

  return (
    <>
      <Button onClick={viewDst} color="inherit" size="small">
        {t("application:modals.view")}
      </Button>
      {Close}
    </>
  );
};

export const ViewDownloadLogAction = (downloadId: string) => (_snackbarId: SnackbarKey | undefined) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const viewLogs = useCallback(() => {
    dispatch(setBatchDownloadLogDialog({ open: true, id: downloadId }));
  }, [dispatch, downloadId]);

  return (
    <>
      <Button onClick={viewLogs} color="inherit" size="small">
        {t("application:fileManager.details")}
      </Button>
    </>
  );
};

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

const BatchDownloadProgressContent = ({ downloadId }: { downloadId: string }) => {
  const { t } = useTranslation("application");
  const dispatch = useAppDispatch();
  const progressRef = useRef<BatchDownloadProgress | undefined>(undefined);
  const [, forceUpdate] = useState(0);

  // Store latest progress in ref without causing re-renders
  const progress = useAppSelector((state) => state.globalState.batchDownloadProgress?.[downloadId]);
  progressRef.current = progress;

  // Only re-render on a 500ms interval to avoid update storms
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const p = progressRef.current;
  if (!p) return null;

  const pct = p.totalExpectedBytes > 0 ? Math.min(100, Math.round((p.totalBytes / p.totalExpectedBytes) * 100)) : 0;

  const onCancel = () => {
    try {
      cancelSignals[downloadId]?.abort();
    } catch {
      // AbortError is expected when cancelling an active download
    }
  };

  const onViewDetails = () => {
    dispatch(setBatchDownloadLogDialog({ open: true, id: downloadId }));
  };

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {t("fileManager.downloadProgress", {
            completed: p.filesCompleted,
            total: p.totalFiles,
            percent: pct,
          })}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {p.speed > 0 && (
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              {formatBytes(p.speed)}/s
            </Typography>
          )}
          <IconButton size="small" onClick={onCancel} color="error" sx={{ p: 0.25 }} aria-label="Cancel download">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {p.currentFile && (
        <Typography
          variant="caption"
          sx={{
            opacity: 0.5,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            mb: 0.5,
          }}
        >
          {p.currentFile}
        </Typography>
      )}
      <LinearProgress variant="determinate" value={pct} sx={{ mb: 0.5, borderRadius: 1 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          {formatBytes(p.totalBytes)} {t("fileManager.downloaded", { defaultValue: "downloaded" })}
        </Typography>
        <Button onClick={onViewDetails} color="inherit" size="small" sx={{ minWidth: "auto", p: 0 }}>
          {t("fileManager.details")}
        </Button>
      </Box>
    </Box>
  );
};

export const BatchDownloadProgressAction = (downloadId: string) => (_snackbarId: SnackbarKey | undefined) => {
  return <BatchDownloadProgressContent downloadId={downloadId} />;
};

const BatchDownloadCompleteContent = ({
  downloadId,
  snackbarId,
}: {
  downloadId: string;
  snackbarId: SnackbarKey | undefined;
}) => {
  const { t } = useTranslation("application");
  const progress = useAppSelector((state) => state.globalState.batchDownloadProgress?.[downloadId]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {progress && (
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {progress.totalFiles} files · {formatBytes(progress.totalBytes)}
        </Typography>
      )}
      <Button onClick={() => closeSnackbar(snackbarId)} color="inherit" size="small">
        {t("dismiss", { ns: "common", defaultValue: "Dismiss" })}
      </Button>
    </Box>
  );
};

export const BatchDownloadCompleteAction = (downloadId: string) => (snackbarId: SnackbarKey | undefined) => {
  return <BatchDownloadCompleteContent downloadId={downloadId} snackbarId={snackbarId} />;
};

export const ViewTaskAction =
  (path: string = "/tasks") =>
  (snackbarId: SnackbarKey | undefined) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const Close = DefaultCloseAction(snackbarId);

    const viewDst = useCallback(() => {
      navigate(path);
      closeSnackbar(snackbarId);
    }, [navigate, snackbarId]);

    return (
      <>
        <Button onClick={viewDst} color="inherit" size="small">
          {t("application:modals.view")}
        </Button>
        {Close}
      </>
    );
  };

export const ServiceWorkerUpdateAction = (updateServiceWorker: () => void) => (snackbarId: SnackbarKey | undefined) => {
  const { t } = useTranslation();

  const Close = DefaultCloseAction(snackbarId);

  const handleUpdate = useCallback(() => {
    // Update service worker and reload
    updateServiceWorker();
    closeSnackbar(snackbarId);
  }, [updateServiceWorker, snackbarId]);

  return (
    <>
      <Button onClick={handleUpdate} color="inherit" size="small">
        {t("common:update")}
      </Button>
      {Close}
    </>
  );
};
