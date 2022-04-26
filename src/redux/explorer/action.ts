import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { CloudreveFile, SortMethod } from "./../../types/index";
import { closeContextMenu } from "../viewUpdate/action";
import { Policy } from "../../component/Uploader/core/types";
import streamSaver from "streamsaver";
import "../../utils/zip";
import pathHelper from "../../utils/page";
import { filePath, isMac } from "../../utils";
import API, { getBaseURL } from "../../middleware/Api";
import { pathJoin, trimPrefix } from "../../component/Uploader/core/utils";
import { getPreviewPath, walk } from "../../utils/api";
import { askForOption } from "./async";
import Auth from "../../middleware/Auth";
import { encodingRequired, isPreviewable } from "../../config";
import { push } from "connected-react-router";
import {
    changeContextMenu,
    closeAllModals,
    openLoadingDialog,
    showAudioPreview,
    showImgPreivew,
    toggleSnackbar,
} from "./index";
import { getDownloadURL } from "../../services/file";

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

type SortFunc = (a: CloudreveFile, b: CloudreveFile) => number;
const sortMethodFuncs: Record<SortMethod, SortFunc> = {
    sizePos: (a: CloudreveFile, b: CloudreveFile) => {
        return a.size - b.size;
    },
    sizeRes: (a: CloudreveFile, b: CloudreveFile) => {
        return b.size - a.size;
    },
    namePos: (a: CloudreveFile, b: CloudreveFile) => {
        return a.name.localeCompare(
            b.name,
            navigator.languages[0] || navigator.language,
            { numeric: true, ignorePunctuation: true }
        );
    },
    nameRev: (a: CloudreveFile, b: CloudreveFile) => {
        return b.name.localeCompare(
            a.name,
            navigator.languages[0] || navigator.language,
            { numeric: true, ignorePunctuation: true }
        );
    },
    timePos: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(a.create_date) - Date.parse(b.create_date);
    },
    timeRev: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(b.create_date) - Date.parse(a.create_date);
    },
    modifyTimePos: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(a.date) - Date.parse(b.date);
    },
    modifyTimeRev: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(b.date) - Date.parse(a.date);
    },
};

export const updateFileList = (
    list: CloudreveFile[]
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState): void => {
        const state = getState();
        // TODO: define state type
        const { sortMethod } = state.viewUpdate;
        const dirList = list.filter((x) => {
            return x.type === "dir";
        });
        const fileList = list.filter((x) => {
            return x.type === "file";
        });
        const sortFunc = sortMethodFuncs[sortMethod as SortMethod];
        dispatch(setDirList(dirList.sort(sortFunc)));
        dispatch(setFileList(fileList.sort(sortFunc)));
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
        dispatch(setDirList(dirList.sort(sortFunc)));
        dispatch(setFileList(fileList.sort(sortFunc)));
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
        dispatch(openLoadingDialog("正在准备打包下载..."));
        const {
            explorer: { selected },
            router: {
                location: { pathname },
            },
        } = getState();
        const dirs: any[] = [],
            items: any[] = [];
        selected.map((value) => {
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
            postBody["path"] = selected[0].path;
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
            dispatch(toggleSnackbar("top", "right", "请先登录", "warning"));
            return;
        }

        dispatch(changeContextMenu("file", false));
        dispatch(openLoadingDialog("获取下载地址..."));
        try {
            const res = await getDownloadURL(file ? file : share);
            window.location.assign(res.data);
            dispatch(closeAllModals());
        } catch (e) {
            toggleSnackbar("top", "right", e.message, "warning");
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
            explorer: { selected },
        } = getState();

        const user = Auth.GetUser();
        if (user.group.allowArchiveDownload) {
            let option: any;
            try {
                option = await dispatch(
                    askForOption(
                        [
                            {
                                key: "client",
                                name: "浏览器端打包",
                                description:
                                    "由浏览器实时下载并打包，并非所有环境都支持。",
                            },
                            {
                                key: "server",
                                name: "服务端中转打包",
                                description:
                                    "由服务端中转打包并实时发送到客户端下载。",
                            },
                        ],
                        "选择打包下载方式"
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

        dispatch(openLoadingDialog("列取文件中..."));

        let queue: CloudreveFile[] = [];
        try {
            queue = await walk(selected, share);
        } catch (e) {
            dispatch(
                toggleSnackbar(
                    "top",
                    "right",
                    `列取文件时出错：${e.message}`,
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
                `打包下载已开始，请不要关闭此标签页`,
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
                        `打包遇到错误：${e && e.message}`,
                        "warning"
                    );
                    dispatch(closeAllModals());
                });
        }
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
                dispatch(toggleSnackbar("top", "right", "请先登录", "warning"));
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
        const {
            selected,
            lastSelect,
            dirList,
            fileList,
            shiftSelectedIds,
        } = explorer;
        if (
            shiftKey &&
            !ctrlKey &&
            !metaKey &&
            selected.length !== 0 &&
            // 点击类型一样
            file.type === lastSelect.file.type
        ) {
            // shift 多选
            // 取消原有选择
            dispatch(removeSelectedTargets(selected.map((v: any) => v.id)));
            // 添加新选择
            const begin = Math.min(lastSelect.index, fileIndex);
            const end = Math.max(lastSelect.index, fileIndex);
            const list = file.type === "dir" ? dirList : fileList;
            const newShiftSelected = list.slice(begin, end + 1);
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
                                name: "缺省",
                            },
                            {
                                key: "gb18030",
                                name: "GB18030",
                                description: "中文常见编码",
                            },
                            ...allOptions,
                        ],
                        "选择 ZIP 文件特殊字符编码"
                    )
                );
            } catch (e) {
                throw new Error("未选择编码方式");
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
