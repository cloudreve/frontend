import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { CloudreveFile, SortMethod } from "./../../types/index";
import { closeContextMenu, setPagination } from "../viewUpdate/action";
import { Policy } from "../../component/Uploader/core/types";
import streamSaver from "streamsaver";
import "../../utils/zip";
import pathHelper from "../../utils/page";
import { filePath, isMac } from "../../utils";
import API, { getBaseURL } from "../../middleware/Api";
import { pathJoin, trimPrefix } from "../../component/Uploader/core/utils";
import { getPreviewPath, walk } from "../../utils/api";
import { askForOption, trySharePurchase } from "./async";
import Auth from "../../middleware/Auth";
import { encodingRequired, isPreviewable } from "../../config";
import { push } from "connected-react-router";
import {
    changeContextMenu,
    closeAllModals,
    navigateTo,
    openDirectoryDownloadDialog,
    openGetSourceDialog,
    openLoadingDialog,
    openTorrentDownloadDialog,
    showAudioPreview,
    showImgPreivew,
    toggleSnackbar,
} from "./index";
import { getDownloadURL } from "../../services/file";
import i18next from "../../i18n";
import {
    getFileSystemDirectoryPaths,
    saveFileToFileSystemDirectory,
    verifyFileSystemRWPermission,
} from "../../utils/filesystem";
import { sortMethodFuncs } from "../../component/FileManager/Sort";

export interface ActionSetFileList extends AnyAction {
    type: "SET_FILE_LIST";
    list: CloudreveFile[];
}
export const setFileList = (list: CloudreveFile[]): ActionSetFileList => {
    return {
        type: "SET_FILE_LIST",
        list,
    };
};

export interface ActionSetDirList extends AnyAction {
    type: "SET_DIR_LIST";
    list: CloudreveFile[];
}
export const setDirList = (list: CloudreveFile[]): ActionSetDirList => {
    return {
        type: "SET_DIR_LIST",
        list,
    };
};

export interface ActionSetSortMethod extends AnyAction {
    type: "SET_SORT_METHOD";
    method: SortMethod;
}
export const setSortMethod = (method: SortMethod): ActionSetSortMethod => {
    return {
        type: "SET_SORT_METHOD",
        method,
    };
};

export const setSideBar = (open: boolean) => {
    return {
        type: "SET_SIDE_BAR",
        open,
    };
};

export const setCurrentPolicy = (policy: Policy) => {
    return {
        type: "SET_CURRENT_POLICY",
        policy,
    };
};

export const removeSelectedTargets = (fileIds: any) => {
    return {
        type: "RMOVE_SELECTED_TARGETS",
        fileIds,
    };
};
export const addSelectedTargets = (targets: any) => {
    return {
        type: "ADD_SELECTED_TARGETS",
        targets,
    };
};
export const setSelectedTarget = (targets: any) => {
    return {
        type: "SET_SELECTED_TARGET",
        targets,
    };
};
export const setLastSelect = (file: any, index: any) => {
    return {
        type: "SET_LAST_SELECT",
        file,
        index,
    };
};
export const setShiftSelectedIds = (shiftSelectedIds: any) => {
    return {
        type: "SET_SHIFT_SELECTED_IDS",
        shiftSelectedIds,
    };
};

export const selectAll = (): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        const state = getState();
        const { selected, fileList, dirList } = state.explorer;
        if (selected.length >= dirList.length + fileList.length) {
            dispatch(setSelectedTarget([]));
        } else {
            dispatch(setSelectedTarget([...dirList, ...fileList]));
        }
    };
};

export const updateFileList = (
    list: CloudreveFile[]
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        const state = getState();
        // TODO: define state type
        const { sortMethod, pagination } = state.viewUpdate;
        const dirList = list.filter((x) => {
            return x.type === "dir";
        });
        const fileList = list.filter((x) => {
            return x.type === "file";
        });
        const sortFunc = sortMethodFuncs[sortMethod as SortMethod];
        dispatch(setDirList(dirList.sort(sortFunc)));
        dispatch(setFileList(fileList.sort(sortFunc)));
        const total = dirList.length + fileList.length;
        if (pagination.page * pagination.size > total) {
            dispatch(
                setPagination({
                    ...pagination,
                    page: Math.max(Math.ceil(total / pagination.size), 1),
                })
            );
        }
    };
};

export const changeSortMethod = (
    method: SortMethod
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        const state = getState();
        const { fileList, dirList } = state.explorer;
        const sortFunc = sortMethodFuncs[method];
        Auth.SetPreference("sort", method);
        dispatch(setSortMethod(method));
        dispatch(setDirList(dirList.slice().sort(sortFunc)));
        dispatch(setFileList(fileList.slice().sort(sortFunc)));
    };
};

export const toggleObjectInfoSidebar = (
    open: boolean
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        const state = getState();
        if (open) {
            dispatch(closeContextMenu());
        }
        dispatch(setSideBar(true));
    };
};

export const serverSideBatchDownload = (
    share: any
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        dispatch(
            openLoadingDialog(i18next.t("fileManager.preparingBathDownload"))
        );
        const {
            explorer: { selected, fileList, dirList },
            router: {
                location: { pathname },
            },
        } = getState();
        const dirs: string[] = [],
            items: string[] = [];
        const fileSources: CloudreveFile[] = selected.length ? selected : [...dirList, ...fileList];
        fileSources.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
            return null;
        });

        let reqURL = "/file/archive";
        const postBody = {
            items: items,
            dirs: dirs,
        };
        if (pathHelper.isSharePage(pathname)) {
            reqURL = "/share/archive/" + share.key;
            postBody["path"] = fileSources[0].path;
        }

        API.post(reqURL, postBody)
            .then((response: any) => {
                if (response.rawData.code === 0) {
                    dispatch(closeAllModals());
                    window.location.assign(response.data);
                } else {
                    dispatch(
                        toggleSnackbar(
                            "top",
                            "right",
                            response.rawData.msg,
                            "warning"
                        )
                    );
                }
                dispatch(closeAllModals());
            })
            .catch((error) => {
                dispatch(
                    toggleSnackbar("top", "right", error.message, "error")
                );
                dispatch(closeAllModals());
            });
    };
};

export const startDownload = (
    share: any,
    file: CloudreveFile
): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<void> => {
        const {
            router: {
                location: { pathname },
            },
        } = getState();
        const user = Auth.GetUser();
        if (
            pathHelper.isSharePage(pathname) &&
            !Auth.Check() &&
            user &&
            !user.group.shareDownload
        ) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("share.pleaseLogin"),
                    "warning"
                )
            );
            return;
        }

        dispatch(changeContextMenu("file", false));

        try {
            await dispatch(trySharePurchase(share));
        } catch (e) {
            return;
        }

        dispatch(openLoadingDialog(i18next.t("fileManager.preparingDownload")));
        try {
            const res = await getDownloadURL(file ? file : share);
            window.location.assign(res.data);
            dispatch(closeAllModals());
        } catch (e) {
            dispatch(toggleSnackbar("top", "right", e.message, "warning"));
            dispatch(closeAllModals());
        }
    };
};

export const startBatchDownload = (
    share: any
): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<void> => {
        dispatch(changeContextMenu("file", false));
        const {
            explorer: { selected, fileList, dirList },
        } = getState();
        try {
            await dispatch(trySharePurchase(share));
        } catch (e) {
            return;
        }

        const user = Auth.GetUser();
        if (user.group.allowArchiveDownload) {
            let option: any;
            try {
                option = await dispatch(
                    askForOption(
                        [
                            {
                                key: "client",
                                name: i18next.t(
                                    "fileManager.browserBatchDownload"
                                ),
                                description: i18next.t(
                                    "fileManager.browserBatchDownloadDescription"
                                ),
                            },
                            {
                                key: "server",
                                name: i18next.t(
                                    "fileManager.serverBatchDownload"
                                ),
                                description: i18next.t(
                                    "fileManager.serverBatchDownloadDescription"
                                ),
                            },
                        ],
                        i18next.t("fileManager.selectArchiveMethod")
                    )
                );
            } catch (e) {
                return;
            }

            if (option.key === "server") {
                dispatch(serverSideBatchDownload(share));
                return;
            }
        }

        dispatch(openLoadingDialog(i18next.t("modals.listingFiles")));

        let queue: CloudreveFile[] = [];
        try {
            const walkSources = selected.length ? selected : [...dirList, ...fileList];
            queue = await walk(walkSources, share);
        } catch (e) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("modals.listingFileError", {
                        message: e.message,
                    }),
                    "warning"
                )
            );
            dispatch(closeAllModals());
            return;
        }

        dispatch(closeAllModals());
        dispatch(
            toggleSnackbar(
                "top",
                "center",
                i18next.t("fileManager.batchDownloadStarted"),
                "info"
            )
        );
        const fileStream = streamSaver.createWriteStream("archive.zip");
        let failed = 0;
        const readableZipStream = new (window as any).ZIP({
            start(ctrl: any) {
                // ctrl.close()
            },
            async pull(ctrl: any) {
                while (queue.length > 0) {
                    const next = queue.pop();
                    if (next && next.type === "file") {
                        const previewPath = getPreviewPath(next);
                        const url =
                            getBaseURL() +
                            (pathHelper.isSharePage(location.pathname)
                                ? "/share/preview/" +
                                  share.key +
                                  (previewPath !== ""
                                      ? "?path=" + previewPath
                                      : "")
                                : "/file/preview/" + next.id);
                        try {
                            const res = await fetch(url, { cache: "no-cache" });
                            const stream = () => res.body;
                            const name = trimPrefix(
                                pathJoin([next.path, next.name]),
                                "/"
                            );
                            ctrl.enqueue({ name, stream });
                            return;
                        } catch (e) {
                            failed++;
                        }
                    }
                }
                ctrl.close();
            },
        });

        // more optimized
        if (window.WritableStream && readableZipStream.pipeTo) {
            return readableZipStream
                .pipeTo(fileStream)
                .then(() => dispatch(closeAllModals()))
                .catch((e) => {
                    console.log(e);
                    toggleSnackbar(
                        "top",
                        "right",
                        i18next.t("modals.batchDownloadError", {
                            message: e && e.message,
                        }),
                        "warning"
                    );
                    dispatch(closeAllModals());
                });
        }
    };
};

let directoryDownloadAbortController: AbortController;
export const cancelDirectoryDownload = () =>
    directoryDownloadAbortController.abort();

export const startDirectoryDownload = (
    share: any
): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<void> => {
        dispatch(changeContextMenu("file", false));

        directoryDownloadAbortController = new AbortController();
        if (!window.showDirectoryPicker || !window.isSecureContext) {
            return;
        }
        let handle: FileSystemDirectoryHandle;
        // we should show directory picker at first
        // https://web.dev/file-system-access/#:~:text=handle%3B%0A%7D-,Gotchas,-Sometimes%20processing%20the
        try {
            // can't use suggestedName for showDirectoryPicker (only available showSaveFilePicker)
            handle = await window.showDirectoryPicker({
                startIn: "downloads",
                mode: "readwrite",
            });
            // we should obtain the readwrite permission for the directory at first
            if (!(await verifyFileSystemRWPermission(handle))) {
                throw new Error(
                    i18next.t("fileManager.directoryDownloadPermissionError")
                );
            }
            dispatch(closeAllModals());
        } catch (e) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("modals.directoryDownloadError", {
                        msg: e && e.message,
                    }),
                    "error"
                )
            );
            dispatch(closeAllModals());
            return;
        }

        const {
            explorer: { selected },
            navigator: { path },
        } = getState();

        // list files to download
        dispatch(openLoadingDialog(i18next.t("modals.listingFiles")));

        let queue: CloudreveFile[] = [];
        try {
            queue = await walk(selected, share);
        } catch (e) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("modals.listingFileError", {
                        message: e.message,
                    }),
                    "warning"
                )
            );
            dispatch(closeAllModals());
            return;
        }

        dispatch(closeAllModals());

        let failed = 0;
        let option: any;
        // preparation for downloading
        // get the files in the directory to compare with queue files
        // parent: ""
        const fsPaths = await getFileSystemDirectoryPaths(handle, "");

        // path: / or /abc (no sep suffix)
        // file.path: /abc/d (no sep suffix)
        // fsPaths: ["abc/d/e.bin",]
        const duplicates = queue
            .map((file) =>
                trimPrefix(
                    `${file.path}/${file.name}`,
                    path === "/" ? "/" : path + "/"
                )
            )
            .filter((path) => fsPaths.includes(path));

        // we should ask users for the duplication handle method
        if (duplicates.length > 0) {
            try {
                option = await dispatch(
                    askForOption(
                        [
                            {
                                key: "replace",
                                name: i18next.t(
                                    "fileManager.directoryDownloadReplace"
                                ),
                                description: i18next.t(
                                    "fileManager.directoryDownloadReplaceDescription",
                                    {
                                        // display the first three duplications
                                        duplicates: duplicates
                                            .slice(
                                                0,
                                                duplicates.length >= 3
                                                    ? 3
                                                    : duplicates.length
                                            )
                                            .join(", "),
                                        num: duplicates.length,
                                    }
                                ),
                            },
                            {
                                key: "skip",
                                name: i18next.t(
                                    "fileManager.directoryDownloadSkip"
                                ),
                                description: i18next.t(
                                    "fileManager.directoryDownloadSkipDescription",
                                    {
                                        duplicates: duplicates
                                            .slice(
                                                0,
                                                duplicates.length >= 3
                                                    ? 3
                                                    : duplicates.length
                                            )
                                            .join(", "),
                                        num: duplicates.length,
                                    }
                                ),
                            },
                        ],
                        i18next.t(
                            "fileManager.selectDirectoryDuplicationMethod"
                        )
                    )
                );
            } catch (e) {
                return;
            }
        }
        dispatch(closeAllModals());

        // start the download
        dispatch(
            toggleSnackbar(
                "top",
                "center",
                i18next.t("fileManager.directoryDownloadStarted"),
                "info"
            )
        );

        const updateLog = (log, done) => {
            dispatch(openDirectoryDownloadDialog(true, log, done));
        };
        let log = "";

        while (queue.length > 0) {
            const next = queue.pop();
            if (next && next.type === "file") {
                // donload url
                const previewPath = getPreviewPath(next);
                const url =
                    getBaseURL() +
                    (pathHelper.isSharePage(location.pathname)
                        ? "/share/preview/" +
                          share.key +
                          (previewPath !== "" ? "?path=" + previewPath : "")
                        : "/file/preview/" + next.id);

                // path to save this file
                // path: / or /abc (no sep suffix)
                // next.path: /abc/d (no sep suffix)
                // name: d/e.bin
                const name = trimPrefix(
                    pathJoin([next.path, next.name]),
                    path === "/" ? "/" : path + "/"
                );
                // TODO: improve the display of log
                // can we turn the upload queue component to the transition queue?
                // then we can easily cancel or retry the download
                // and the batch download queue can show as well.
                log =
                    (log === "" ? "" : log + "\n\n") +
                    i18next.t("modals.directoryDownloadStarted", { name });
                updateLog(log, false);
                try {
                    if (duplicates.includes(name)) {
                        if (option.key === "skip") {
                            log +=
                                "\n" +
                                i18next.t(
                                    "modals.directoryDownloadSkipNotifiction",
                                    {
                                        name,
                                    }
                                );
                            updateLog(log, false);
                            continue;
                        } else {
                            log +=
                                "\n" +
                                i18next.t(
                                    "modals.directoryDownloadReplaceNotifiction",
                                    {
                                        name,
                                    }
                                );
                            updateLog(log, false);
                        }
                    }

                    // TODO: need concurrent task queue?
                    const res = await fetch(url, {
                        cache: "no-cache",
                        signal: directoryDownloadAbortController.signal,
                    });
                    await saveFileToFileSystemDirectory(
                        handle,
                        await res.blob(),
                        name
                    );
                    log += "\n" + i18next.t("modals.directoryDownloadFinished");
                    updateLog(log, false);
                } catch (e) {
                    if (e.name === "AbortError") {
                        dispatch(
                            toggleSnackbar(
                                "top",
                                "right",
                                i18next.t("modals.directoryDownloadCancelled"),
                                "warning"
                            )
                        );
                        log +=
                            "\n\n" +
                            i18next.t("modals.directoryDownloadCancelled");
                        updateLog(log, true);
                        return;
                    }

                    failed++;
                    dispatch(
                        toggleSnackbar(
                            "top",
                            "right",
                            i18next.t(
                                "modals.directoryDownloadErrorNotification",
                                {
                                    name,
                                    msg: e && e.message,
                                }
                            ),
                            "warning"
                        )
                    );
                    log +=
                        "\n" +
                        i18next.t("modals.directoryDownloadError", {
                            msg: e.message,
                        });
                    updateLog(log, false);
                }
            }
        }
        log +=
            "\n" +
            (failed === 0
                ? i18next.t("fileManager.directoryDownloadFinished")
                : i18next.t("fileManager.directoryDownloadFinishedWithError", {
                      failed,
                  }));
        updateLog(log, true);

        dispatch(
            toggleSnackbar(
                "top",
                "center",
                failed === 0
                    ? i18next.t("fileManager.directoryDownloadFinished")
                    : i18next.t(
                          "fileManager.directoryDownloadFinishedWithError",
                          {
                              failed,
                          }
                      ),
                "success"
            )
        );
    };
};

export const getViewerURL = (
    viewer: string,
    file: any,
    isShare: boolean | ""
): string => {
    const previewPath = getPreviewPath(file);
    if (isShare) {
        return (
            "/s/" +
            file.key +
            `/${viewer}?name=` +
            encodeURIComponent(file.name) +
            "&share_path=" +
            previewPath
        );
    }

    return `/${viewer}?p=` + previewPath + "&id=" + file.id;
};

export const openViewer = (
    viewer: string,
    file: any,
    isShare: boolean | ""
) => {
    return (dispatch: any, getState: any) => {
        dispatch(push(getViewerURL(viewer, file, isShare)));
    };
};

export const openPreview = (share: any) => {
    return (dispatch: any, getState: any) => {
        const {
            explorer: { selected },
            router: {
                location: { pathname },
            },
        } = getState();
        const isShare = pathHelper.isSharePage(pathname);
        if (isShare) {
            const user = Auth.GetUser();
            if (!Auth.Check() && user && !user.group.shareDownload) {
                dispatch(
                    toggleSnackbar(
                        "top",
                        "right",
                        i18next.t("share.pleaseLogin"),
                        "warning"
                    )
                );
                dispatch(changeContextMenu("file", false));
                return;
            }
        }

        dispatch(changeContextMenu("file", false));
        switch (isPreviewable(selected[0].name)) {
            case "img":
                dispatch(showImgPreivew(selected[0]));
                return;
            case "msDoc":
                dispatch(openViewer("doc", selected[0], isShare));
                return;
            case "audio":
                dispatch(showAudioPreview(selected[0]));
                return;
            case "video":
                dispatch(openViewer("video", selected[0], isShare));
                return;
            case "pdf":
                dispatch(openViewer("pdf", selected[0], isShare));
                return;
            case "edit":
                dispatch(openViewer("text", selected[0], isShare));
                return;
            case "code":
                dispatch(openViewer("code", selected[0], isShare));
                return;
            case "epub":
                dispatch(openViewer("epub", selected[0], isShare));
                return;
            default:
                dispatch(startDownload(share, selected[0]));
                return;
        }
    };
};
export const selectFile = (file: any, event: any, fileIndex: any) => {
    const { ctrlKey, metaKey, shiftKey } = event;
    return (dispatch: any, getState: any) => {
        // 多种组合操作忽略
        if (
            [ctrlKey, shiftKey].filter(Boolean).length > 1 ||
            [metaKey, shiftKey].filter(Boolean).length > 1
        ) {
            return;
        }
        const isMacbook = isMac();
        const { explorer } = getState();
        const { selected, lastSelect, dirList, fileList, shiftSelectedIds } =
            explorer;
        if (shiftKey && !ctrlKey && !metaKey && selected.length !== 0) {
            // shift 多选
            // 取消原有选择
            dispatch(removeSelectedTargets(selected.map((v: any) => v.id)));
            const all = [...dirList, ...fileList];
            // 添加新选择
            const begin = Math.min(lastSelect.index, fileIndex);
            const end = Math.max(lastSelect.index, fileIndex);
            const list = file.type === "dir" ? dirList : fileList;
            const newShiftSelected = all.slice(begin, end + 1);
            return dispatch(addSelectedTargets(newShiftSelected));
        }
        dispatch(setLastSelect(file, fileIndex));
        dispatch(setShiftSelectedIds([]));
        if ((ctrlKey && !isMacbook) || (metaKey && isMacbook)) {
            // Ctrl/Command 单击添加/删除
            const presentIndex = selected.findIndex((value: any) => {
                return value.id === file.id;
            });
            if (presentIndex !== -1) {
                return dispatch(removeSelectedTargets([file.id]));
            }
            return dispatch(addSelectedTargets([file]));
        }
        // 单选
        return dispatch(setSelectedTarget([file]));
    };
};

export const submitCompressTask = (fileName: string, path: string) => {
    return async (dispatch: any, getState: any) => {
        const {
            explorer: { selected },
        } = getState();
        const dirs: string[] = [],
            items: string[] = [];
        // eslint-disable-next-line
        selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });

        return await API.post("/file/compress", {
            src: {
                dirs: dirs,
                items: items,
            },
            name: fileName,
            dst: path === "//" ? "/" : path,
        });
    };
};

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
    "big5",
    "eucjp",
    "iso2022jp",
    "shiftjis",
    "euckr",
    "utf16be",
    "utf16le",
];

export const submitDecompressTask = (path: string) => {
    return async (dispatch: any, getState: any) => {
        const {
            explorer: { selected },
        } = getState();

        let encoding = "";
        if (selected.length > 0 && encodingRequired(selected[0].name)) {
            let option: any;
            try {
                const allOptions = encodings.map((e) => {
                    return {
                        key: e,
                        name: e.toUpperCase(),
                    };
                });
                option = await dispatch(
                    askForOption(
                        [
                            {
                                key: "",
                                name: i18next.t("modals.defaultEncoding"),
                            },
                            {
                                key: "gb18030",
                                name: "GB18030",
                                description: i18next.t(
                                    "modals.chineseMajorEncoding"
                                ),
                            },
                            ...allOptions,
                        ],
                        i18next.t("modals.selectEncoding")
                    )
                );
            } catch (e) {
                throw new Error(i18next.t("modals.noEncodingSelected"));
            }

            encoding = option.key;
        }

        return await API.post("/file/decompress", {
            src: filePath(selected[0]),
            dst: path === "//" ? "/" : path,
            encoding: encoding,
        });
    };
};

export const batchGetSource = (): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<any> => {
        const {
            explorer: { selected },
            router: {
                location: { pathname },
            },
        } = getState();

        if (selected.findIndex((f) => f.type === "dir") >= 0) {
            dispatch(openLoadingDialog(i18next.t("modals.listingFiles")));
        }

        let queue: CloudreveFile[] = [];
        try {
            queue = await walk(selected, null);
        } catch (e) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("modals.listingFileError", {
                        message: e.message,
                    }),
                    "warning"
                )
            );
            dispatch(closeAllModals());
            return;
        }

        dispatch(openLoadingDialog(i18next.t("modals.generatingSourceLinks")));

        const items = queue
            .filter((value) => value.source_enabled && value.type === "file")
            .map((v) => v.id);

        if (items.length === 0) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("modals.noFileCanGenerateSourceLink"),
                    "warning"
                )
            );
            dispatch(closeAllModals());
            return;
        }

        const user = Auth.GetUser();
        if (items.length > user.group.sourceBatch) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    i18next.t("modals.sourceBatchSizeExceeded", {
                        limit: user.group.sourceBatch,
                    }),
                    "warning"
                )
            );
            dispatch(closeAllModals());
            return;
        }

        API.post("/file/source", { items: items })
            .then((response) => {
                dispatch(closeAllModals());
                if (response.data.length == 1 && response.data[0].error) {
                    dispatch(
                        toggleSnackbar(
                            "top",
                            "right",
                            response.data[0].error,
                            "warning"
                        )
                    );
                    return;
                }

                dispatch(
                    openGetSourceDialog(
                        response.data.length == 1
                            ? response.data[0].url
                            : response.data
                                  .map(
                                      (res) =>
                                          `${res.name}: ${res.url}${
                                              res.error ? res.error : ""
                                          }`
                                  )
                                  .join("\n")
                    )
                );
            })
            .catch((error) => {
                dispatch(
                    toggleSnackbar("top", "right", error.message, "warning")
                );
                dispatch(closeAllModals());
            });
    };
};

export const openTorrentDownload = (): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        const {
            explorer: { selected },
        } = getState();
        dispatch(openTorrentDownloadDialog(selected[0]));
    };
};

export const openParentFolder = (): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<any> => {
        const {
            explorer: { selected },
        } = getState();

        dispatch(openLoadingDialog(i18next.t("modals.processing")));
        API.get(
            "/object/property/" +
            selected[0].id +
            "?trace_root=true&is_folder=" +
            (selected[0].type === "dir").toString()
        )
            .then((response) => {
                const path =
                    response.data.path === ""
                        ? selected[0].path
                        : response.data.path;
                dispatch(navigateTo(path));
                dispatch(closeAllModals());
            })
            .catch((error) => {
                dispatch(
                    toggleSnackbar("top", "right", error.message, "warning")
                );
                dispatch(closeAllModals());
            });
    };
};
