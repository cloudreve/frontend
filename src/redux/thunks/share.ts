import { FileResponse, Share, ShareCreateService } from "../../api/explorer.ts";
import { AppThunk } from "../store.ts";
import { ShareSetting } from "../../component/FileManager/Dialogs/Share/ShareSetting.tsx";
import { getFileInfo, getShareInfo, sendCreateShare, sendUpdateShare } from "../../api/api.ts";
import { fileUpdated } from "../fileManagerSlice.ts";
import CrUri from "../../util/uri.ts";
import { addShareInfo, setManageShareDialog, setShareLinkDialog } from "../globalStateSlice.ts";
import { longRunningTaskWithSnackbar } from "./file.ts";
import { enqueueSnackbar } from "notistack";
import { DefaultCloseAction } from "../../component/Common/Snackbar/snackbar.tsx";
import i18next from "i18next";

export function createOrUpdateShareLink(
  index: number,
  file: FileResponse,
  setting: ShareSetting,
  existed?: string,
): AppThunk<Promise<string>> {
  return async (dispatch, getState) => {
    const req: ShareCreateService = {
      uri: file.path,
      is_private: setting.is_private,
      downloads: setting.downloads && setting.downloads_val.value > 0 ? setting.downloads_val.value : undefined,
      expire: setting.expires && setting.expires_val.value > 0 ? setting.expires_val.value : undefined,
    };

    const res = await dispatch(existed ? sendUpdateShare(req, existed) : sendCreateShare(req));
    dispatch(
      fileUpdated({
        index,
        value: [
          {
            file: { ...file, shared: true },
            oldPath: file.path,
          },
        ],
      }),
    );

    if (existed) {
      const {
        globalState: { manageShareDialogOpen, manageShareDialogFile },
      } = getState();
      if (manageShareDialogOpen && manageShareDialogFile?.path === file.path) {
        dispatch(
          setManageShareDialog({
            open: true,
            file: {
              ...manageShareDialogFile,
              extended_info: undefined,
            },
          }),
        );
      }
    }

    return res;
  };
}

interface shareInfoQueueItem {
  resolve: (value: Share | PromiseLike<Share>) => void;
  reject: (reason?: any) => void;
}

const shareInfoLoadQueue: {
  [key: string]: shareInfoQueueItem[];
} = {};

export function queueLoadShareInfo(uri: CrUri, countViews: boolean = false): AppThunk<Promise<Share>> {
  return async (dispatch, getState) => {
    const id = `${uri.id()}/${uri.password()}/${countViews}`;
    const cached = getState().globalState.shareInfo[id];
    if (cached) {
      return cached;
    }
    if (!shareInfoLoadQueue[id]) {
      shareInfoLoadQueue[id] = [];
    }

    const p = new Promise<Share>((resolve, reject) => {
      shareInfoLoadQueue[id].push({ resolve, reject });
    });

    if (shareInfoLoadQueue[id].length === 1) {
      dispatch(getShareInfo(uri.id(), uri.password(), countViews))
        .then((res) => {
          shareInfoLoadQueue[id].forEach((item) => {
            item.resolve(res);
          });
          dispatch(addShareInfo({ id, info: res }));
        })
        .catch((e) => {
          shareInfoLoadQueue[id].forEach((item) => {
            item.reject(e);
          });
        })
        .finally(() => {
          delete shareInfoLoadQueue[id];
        });
    }

    return p;
  };
}

export function openShareEditByID(shareId: string, password?: string): AppThunk {
  return async (dispatch) => {
    try {
      const { share, file } = await longRunningTaskWithSnackbar(
        dispatch(getFileAndShareById(shareId, password)),
        "application:uploader.processing",
      );
      dispatch(
        setShareLinkDialog({
          open: true,
          file: file,
          share: share,
        }),
      );
    } catch (e) {
      console.log(e);
      return;
    }
  };
}

function getFileAndShareById(
  shareId: string,
  password?: string,
): AppThunk<
  Promise<{
    share: Share;
    file: FileResponse;
  }>
> {
  return async (dispatch) => {
    let share: Share | undefined;
    try {
      share = await dispatch(getShareInfo(shareId, password, false, true));
    } catch (e) {
      enqueueSnackbar({
        message: i18next.t("application:share.shareNotExist"),
        variant: "error",
        action: DefaultCloseAction,
      });
      throw e;
    }

    const file = await dispatch(getFileInfo({ uri: share.source_uri ?? "" }));
    return { share, file };
  };
}
