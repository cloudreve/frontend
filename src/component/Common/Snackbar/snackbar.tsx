import { Button } from "@mui/material";
import { closeSnackbar, SnackbarKey } from "notistack";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileResponse } from "../../../api/explorer.ts";
import { Response } from "../../../api/request.ts";
import { setBatchDownloadLogDialog, setShareReadmeOpen } from "../../../redux/globalStateSlice.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { showAggregatedErrorDialog } from "../../../redux/thunks/dialog.ts";
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
