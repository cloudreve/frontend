import dayjs from "dayjs";
import i18next from "i18next";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import streamSaver from "streamsaver";
import { getFileEntityUrl } from "../../api/api.ts";
import { FileResponse, FileType, Metadata } from "../../api/explorer.ts";
import { GroupPermission } from "../../api/user.ts";
import { ViewDownloadLogAction } from "../../component/Common/Snackbar/snackbar.tsx";
import SessionManager from "../../session";
import { getFileLinkedUri } from "../../util";
import Boolset from "../../util/boolset.ts";
import { formatLocalTime } from "../../util/datetime.ts";
import {
  getFileSystemDirectoryPaths,
  saveFileToFileSystemDirectory,
  verifyFileSystemRWPermission,
} from "../../util/filesystem.ts";
import "../../util/zip.js";
import { closeContextMenu } from "../fileManagerSlice.ts";
import {
  DialogSelectOption,
  setBatchDownloadLog,
} from "../globalStateSlice.ts";
import { AppThunk } from "../store.ts";
import { promiseId, selectOption } from "./dialog.ts";
import { longRunningTaskWithSnackbar, walk, walkAll } from "./file.ts";

const streamSaverParam = "stream_saver";

enum MultipleDownloadOption {
  Browser,
  StreamSaver,
  Backend,
}

enum DownloadOverwriteOption {
  Skip,
  Overwrite,
  OverwriteAll,
  SkipAll,
}

export function downloadFiles(index: number, files: FileResponse[]): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(closeContextMenu({ index, value: undefined }));
    if (files.length == 1 && files[0].type == FileType.file) {
      await dispatch(downloadSingleFile(files[0]));
    } else {
      await dispatch(downloadMultipleFiles(files));
    }
  };
}

export function downloadMultipleFiles(files: FileResponse[]): AppThunk {
  return async (dispatch, _getState) => {
    // Prepare download options
    const options: MultipleDownloadOption[] = [
      MultipleDownloadOption.StreamSaver,
    ];
    // @ts-ignore
    if (window.isSecureContext && window.showDirectoryPicker) {
      options.push(MultipleDownloadOption.Browser);
    }

    const groupPermission = new Boolset(
      SessionManager.currentUser()?.group?.permission,
    );
    if (
      groupPermission.enabled(GroupPermission.archive_download) &&
      (files.length > 1 || !files[0].metadata?.[Metadata.share_redirect])
    ) {
      options.push(MultipleDownloadOption.Backend);
    }

    let finalOption = options[0];
    if (options.length > 1) {
      try {
        finalOption = (await dispatch(
          selectOption(
            getDownloadSelectOption(options),
            "fileManager.selectArchiveMethod",
          ),
        )) as MultipleDownloadOption;
      } catch (e) {
        // User cancel selection
        return;
      }
    }

    if (finalOption == MultipleDownloadOption.Backend) {
      await dispatch(backendBatchDownload(files));
    } else if (finalOption == MultipleDownloadOption.Browser) {
      await dispatch(browserBatchDownload(files));
    } else {
      await dispatch(streamSaverDownload(files));
    }
  };
}

export function backendBatchDownload(files: FileResponse[]): AppThunk {
  return async (dispatch, _getState) => {
    const downloadUrl = await longRunningTaskWithSnackbar(
      dispatch(
        getFileEntityUrl({
          uris: files.map((f) => getFileLinkedUri(f)),
          archive: true,
        }),
      ),
      "application:fileManager.preparingBathDownload",
    );

    window.location.assign(downloadUrl.urls[0]);
  };
}

export const cancelSignals: {
  [key: string]: AbortController;
} = {};

export function browserBatchDownload(files: FileResponse[]): AppThunk {
  return async (dispatch, _getState) => {
    const downloadId = promiseId();
    cancelSignals[downloadId] = new AbortController();

    // Select download folder
    let handle: FileSystemDirectoryHandle;
    if (!window.showDirectoryPicker || !window.isSecureContext) {
      return;
    }
    try {
      // can't use suggestedName for showDirectoryPicker (only available showSaveFilePicker)
      handle = await window.showDirectoryPicker({
        startIn: "downloads",
        mode: "readwrite",
      });
      // we should obtain the readwrite permission for the directory at first
      if (!(await verifyFileSystemRWPermission(handle))) {
        enqueueSnackbar({
          message: i18next.t(
            "application:fileManager.directoryDownloadPermissionError",
          ),
          variant: "error",
        });
        throw new Error(
          i18next.t("application:fileManager.directoryDownloadPermissionError"),
        );
      }
    } catch (e) {
      return;
    }

    await longRunningTaskWithSnackbar(
      dispatch(startBrowserBatchDownloadTo(handle, downloadId, files)),
      "fileManager.batchDownloadStarted",
      ViewDownloadLogAction(downloadId),
    );
  };
}

function startBrowserBatchDownloadTo(
  handle: FileSystemDirectoryHandle,
  downloadId: string,
  files: FileResponse[],
): AppThunk<Promise<void>> {
  return async (dispatch, _getState): Promise<void> => {
    let log = "";
    let failed = 0;
    let skipAll = false;
    let overwriteAll = false;

    const appendLog = (msg: string) => {
      log = log + msg + "\n";
      dispatch(setBatchDownloadLog({ id: downloadId, logs: log }));
    };
    // get the files in the directory to compare with queue files
    // parent: ""
    const fsPaths = await getFileSystemDirectoryPaths(handle, "");

    await dispatch(
      walk(files, async (children, relativePath) => {
        const childFiles = children.filter((f) => f.type == FileType.file);
        try {
          const entityUrls = await dispatch(
            getFileEntityUrl({
              uris: childFiles.map((f) => getFileLinkedUri(f)),
              download: true,
              skip_error: true,
            }),
          );

          for (let i = 0; i < entityUrls.urls.length; i++) {
            if (!entityUrls.urls[i]) {
              appendLog(
                i18next.t("modals.directoryDownloadErrorNotification", {
                  name: childFiles[i].name,
                  msg: "failed to get download url",
                }),
              );
              failed++;
              continue;
            }
            const name =
              (relativePath == "" ? "" : relativePath + "/") +
              childFiles[i].name;
            if (fsPaths.has(name)) {
              if (skipAll) {
                appendLog(
                  i18next.t("modals.directoryDownloadSkipNotifiction", {
                    name,
                  }),
                );
                continue;
              }

              if (overwriteAll) {
                appendLog(
                  i18next.t("modals.directoryDownloadReplaceNotifiction", {
                    name,
                  }),
                );
              } else {
                // No overwrite options, ask for one
                let overwriteOption = DownloadOverwriteOption.Skip;
                try {
                  overwriteOption = (await dispatch(
                    selectOption(
                      getDownloadOverwriteOption(name),
                      "fileManager.selectDirectoryDuplicationMethod",
                    ),
                  )) as DownloadOverwriteOption;
                } catch (e) {
                  // User cancel, use skip option
                  overwriteOption = DownloadOverwriteOption.Skip;
                }

                if (overwriteOption == DownloadOverwriteOption.Skip) {
                  appendLog(
                    i18next.t("modals.directoryDownloadSkipNotifiction", {
                      name,
                    }),
                  );
                  continue;
                } else if (overwriteOption == DownloadOverwriteOption.SkipAll) {
                  appendLog(
                    i18next.t("modals.directoryDownloadSkipNotifiction", {
                      name,
                    }),
                  );
                  skipAll = true;
                  continue;
                } else if (
                  overwriteOption == DownloadOverwriteOption.OverwriteAll
                ) {
                  appendLog(
                    i18next.t("modals.directoryDownloadReplaceNotifiction", {
                      name,
                    }),
                  );
                  overwriteAll = true;
                } else {
                  appendLog(
                    i18next.t("modals.directoryDownloadReplaceNotifiction", {
                      name,
                    }),
                  );
                }
              }
            }

            appendLog(i18next.t("modals.directoryDownloadStarted", { name }));
            try {
              const res = await fetch(entityUrls.urls[i], {
                signal: cancelSignals[downloadId].signal,
              });
              await saveFileToFileSystemDirectory(
                handle,
                await res.blob(),
                name,
              );
              appendLog(
                i18next.t("modals.directoryDownloadFinished", { name }),
              );
            } catch (e) {
              // User cancel download
              if (e instanceof Error && e.name == "AbortError") {
                appendLog(i18next.t("modals.directoryDownloadCancelled"));
                throw e;
              }
              failed++;
              appendLog(
                i18next.t("modals.directoryDownloadErrorNotification", {
                  name: name,
                  msg: (e as Error).message,
                }),
              );
            }
          }
        } catch (e) {
          if (e instanceof Error && e.name == "AbortError") {
            throw e;
          }
          failed += childFiles.length;
          appendLog(
            i18next.t("modals.directoryDownloadError", {
              msg: (e as Error).message,
            }),
          );
        }
      }),
    );

    if (failed === 0) {
      appendLog(i18next.t("fileManager.directoryDownloadFinished"));
    } else {
      appendLog(
        i18next.t("fileManager.directoryDownloadFinishedWithError", { failed }),
      );
    }
  };
}

export function streamSaverDownload(files: FileResponse[]): AppThunk {
  return async (dispatch, getState) => {
    const allFiles = (
      await longRunningTaskWithSnackbar(
        dispatch(walkAll(files)),
        "application:fileManager.preparingBathDownload",
      )
    ).filter((f) => f.type == FileType.file);

    const fileStream = streamSaver.createWriteStream(
      formatLocalTime(dayjs()) + ".zip",
    );
    const {
      siteConfig: {
        explorer: {
          config: { max_batch_size },
        },
      },
    } = getState();
    const maxBatch = Math.min(10, max_batch_size ?? 1);
    let current = 0;

    const readableZipStream = new (window as any).ZIP({
      start(_ctrl: any) {
        // ctrl.close()
      },
      async pull(ctrl: any) {
        const batch = allFiles.slice(current, current + maxBatch);
        current += batch.length;
        if (batch.length == 0) {
          ctrl.close();
          return;
        }

        try {
          const entityUrls = await dispatch(
            getFileEntityUrl({
              uris: batch.map((f) => getFileLinkedUri(f)),
              skip_error: true,
              download: true,
            }),
          );

          for (let i = 0; i < entityUrls.urls.length; i++) {
            const url = entityUrls.urls[i];
            if (!url) {
              continue;
            }
            const res = await fetch(url);
            const stream = () => res.body;
            ctrl.enqueue({ name: batch[i].relativePath, stream });
          }
        } catch (e) {
          console.warn("Failed to get entity urls", e);
        }
      },
    });

    if (window.WritableStream && readableZipStream.pipeTo) {
      try {
        await longRunningTaskWithSnackbar(
          readableZipStream.pipeTo(fileStream),
          "fileManager.batchDownloadStarted",
        );
      } catch (e) {
        console.log(e);
      }
    }
  };
}

export function downloadSingleFile(
  file: FileResponse,
  preferredEntity?: string,
): AppThunk {
  return async (dispatch, _getState) => {
    const urlRes = await longRunningTaskWithSnackbar(
      dispatch(
        getFileEntityUrl({
          uris: [getFileLinkedUri(file)],
          entity: preferredEntity,
          download: true,
        }),
      ),
      "application:fileManager.preparingDownload",
    );

    const downloadUrl = new URL(urlRes.urls[0]);
    const streamSaverName = downloadUrl.searchParams.get(streamSaverParam);
    if (streamSaverName) {
      // remove streamSaverParam from query
      downloadUrl.searchParams.delete(streamSaverParam);
      const fileStream = streamSaver.createWriteStream(streamSaverName);
      const res = await fetch(downloadUrl.toString());
      const readableStream = res.body;
      if (!readableStream) {
        return;
      }

      // more optimized
      if (window.WritableStream && readableStream.pipeTo) {
        const downloadingSnackbar = enqueueSnackbar({
          message: i18next.t("fileManager.downloadingFile", {
            name: streamSaverName,
          }),
          variant: "loading",
          persist: true,
        });
        return readableStream
          .pipeTo(fileStream)
          .finally(() => closeSnackbar(downloadingSnackbar));
      }
    } else {
      window.location.assign(urlRes.urls[0]);
    }
  };
}

const getDownloadSelectOption = (
  options: MultipleDownloadOption[],
): DialogSelectOption[] => {
  return options.map((option): DialogSelectOption => {
    switch (option) {
      case MultipleDownloadOption.Backend:
        return {
          value: MultipleDownloadOption.Backend,
          name: i18next.t("fileManager.serverBatchDownload"),
          description: i18next.t("fileManager.serverBatchDownloadDescription"),
        };
      case MultipleDownloadOption.Browser:
        return {
          value: MultipleDownloadOption.Browser,
          name: i18next.t("fileManager.browserDownload"),
          description: i18next.t("fileManager.browserDownloadDescription"),
        };
      default:
        return {
          value: MultipleDownloadOption.StreamSaver,
          name: i18next.t("fileManager.browserBatchDownload"),
          description: i18next.t("fileManager.browserBatchDownloadDescription"),
        };
    }
  });
};

const getDownloadOverwriteOption = (name: string): DialogSelectOption[] => {
  return [
    {
      name: i18next.t("fileManager.directoryDownloadReplace"),
      description: i18next.t(
        "fileManager.directoryDownloadReplaceDescription",
        { name },
      ),
      value: DownloadOverwriteOption.Overwrite,
    },
    {
      name: i18next.t("fileManager.directoryDownloadSkip"),
      description: i18next.t("fileManager.directoryDownloadSkipDescription", {
        name,
      }),
      value: DownloadOverwriteOption.Skip,
    },
    {
      name: i18next.t("fileManager.directoryDownloadReplaceAll"),
      description: i18next.t(
        "fileManager.directoryDownloadReplaceAllDescription",
        { name },
      ),
      value: DownloadOverwriteOption.OverwriteAll,
    },
    {
      name: i18next.t("fileManager.directoryDownloadSkipAll"),
      description: i18next.t(
        "fileManager.directoryDownloadSkipAllDescription",
        { name },
      ),
      value: DownloadOverwriteOption.SkipAll,
    },
  ];
};
