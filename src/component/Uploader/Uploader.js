import React, { useCallback, useEffect, useMemo, useState } from "react";
import UploadManager, { SelectType } from "./core";
import { useDispatch, useSelector } from "react-redux";
import UploadButton from "../Dial/Create";
import pathHelper from "../../utils/page";
import { useLocation } from "react-router-dom";
import { UploaderError } from "./core/errors";
import TaskList from "./Popup/TaskList";
import { Status } from "./core/uploader/base";
import { DropFileBackground } from "../Placeholder/DropFile";
import {
    refreshFileList,
    refreshStorage,
    toggleSnackbar,
} from "../../redux/explorer";
import Auth from "../../middleware/Auth";
import { useTranslation } from "react-i18next";

let totalProgressCollector = null;
let lastProgressStart = -1;
let dragCounter = 0;

export default function Uploader() {
    const { t } = useTranslation("application", { keyPrefix: "uploader" });
    const [uploaders, setUploaders] = useState([]);
    const [taskListOpen, setTaskListOpen] = useState(false);
    const [dropBgOpen, setDropBgOpen] = useState(0);
    const [totalProgress, setTotalProgress] = useState({
        totalSize: 0,
        processedSize: 0,
        total: 0,
        processed: 0,
    });
    const search = useSelector((state) => state.explorer.search);
    const policy = useSelector((state) => state.explorer.currentPolicy);
    const isLogin = useSelector((state) => state.viewUpdate.isLogin);
    const path = useSelector((state) => state.navigator.path);
    const fileSelectCounter = useSelector(
        (state) => state.viewUpdate.openFileSelector
    );
    const folderSelectCounter = useSelector(
        (state) => state.viewUpdate.openFolderSelector
    );
    const location = useLocation();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const RefreshFileList = useCallback(() => dispatch(refreshFileList()), [
        dispatch,
    ]);
    const RefreshStorage = useCallback(() => dispatch(refreshStorage()), [
        dispatch,
    ]);

    const enableUploader = useMemo(
        () => pathHelper.isHomePage(location.pathname) && isLogin && !search,
        [location.pathname, isLogin, search]
    );

    const taskAdded = (original = null) => (tasks) => {
        if (original !== null) {
            if (tasks.length !== 1 || tasks[0].key() !== original.key()) {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("fileNotMatchError"),
                    "warning"
                );
                return;
            }
        }

        tasks.forEach((t) => t.start());

        setTaskListOpen(true);
        setUploaders((uploaders) => {
            if (original !== null) {
                uploaders = uploaders.filter((u) => u.key() !== original.key());
            }

            return [...uploaders, ...tasks];
        });
    };

    const uploadManager = useMemo(() => {
        return new UploadManager({
            logLevel: "INFO",
            concurrentLimit: parseInt(
                Auth.GetPreferenceWithDefault("concurrent_limit", "5")
            ),
            dropZone: document.querySelector("body"),
            onToast: (type, msg) => {
                ToggleSnackbar("top", "right", msg, type);
            },
            onDropOver: (e) => {
                dragCounter++;
                setDropBgOpen((value) => !value);
            },
            onDropLeave: (e) => {
                dragCounter--;
                setDropBgOpen((value) => !value);
            },
            onDropFileAdded: taskAdded(),
        });
    }, []);

    useEffect(() => {
        uploadManager.setPolicy(policy, path);
    }, [policy]);

    useEffect(() => {
        const unfinished = uploadManager.resumeTasks();
        setUploaders((uploaders) => [...uploaders, ...unfinished]);
        if (!totalProgressCollector) {
            totalProgressCollector = setInterval(() => {
                const progress = {
                    totalSize: 0,
                    processedSize: 0,
                    total: 0,
                    processed: 0,
                };
                setUploaders((uploaders) => {
                    uploaders.forEach((u) => {
                        if (u.id <= lastProgressStart) {
                            return;
                        }

                        progress.totalSize += u.task.size;
                        progress.total += 1;

                        if (
                            u.status === Status.finished ||
                            u.status === Status.canceled ||
                            u.status === Status.error
                        ) {
                            progress.processedSize += u.task.size;
                            progress.processed += 1;
                        }

                        if (
                            u.status === Status.added ||
                            u.status === Status.initialized ||
                            u.status === Status.queued ||
                            u.status === Status.preparing ||
                            u.status === Status.processing ||
                            u.status === Status.finishing
                        ) {
                            progress.processedSize += u.progress
                                ? u.progress.total.loaded
                                : 0;
                        }
                    });

                    if (
                        progress.total > 0 &&
                        progress.processed === progress.total
                    ) {
                        lastProgressStart = uploaders[uploaders.length - 1].id;
                    }
                    return uploaders;
                });

                if (
                    progress.total > 0 &&
                    progress.total === progress.processed
                ) {
                    RefreshFileList();
                    RefreshStorage();
                }

                setTotalProgress(progress);
            }, 2000);
        }
    }, []);

    const selectFile = (path, type = SelectType.File, original = null) => {
        setTaskListOpen(true);

        // eslint-disable-next-line no-unreachable
        uploadManager
            .select(path, type)
            .then(taskAdded(original))
            .catch((e) => {
                if (e instanceof UploaderError) {
                    ToggleSnackbar("top", "right", e.Message(), "warning");
                } else {
                    ToggleSnackbar(
                        "top",
                        "right",
                        t("unknownError", { msg: e.message }),
                        "error"
                    );
                }
            });
    };

    useEffect(() => {
        if (fileSelectCounter > 0) {
            selectFile(path);
        }
    }, [fileSelectCounter]);

    useEffect(() => {
        if (folderSelectCounter > 0) {
            selectFile(path, SelectType.Directory);
        }
    }, [folderSelectCounter]);

    const deleteTask = (filter) => {
        setUploaders((uploaders) => uploaders.filter(filter));
    };

    return (
        <>
            {enableUploader && (
                <>
                    <DropFileBackground open={dropBgOpen > 0} />
                    <UploadButton
                        progress={totalProgress}
                        taskListOpen={taskListOpen}
                        selectFile={selectFile}
                        Queued={uploaders.length}
                        openFileList={() => setTaskListOpen(true)}
                    />
                    <TaskList
                        progress={totalProgress}
                        uploadManager={uploadManager}
                        taskList={uploaders}
                        open={taskListOpen}
                        onCancel={deleteTask}
                        selectFile={selectFile}
                        onClose={() => setTaskListOpen(false)}
                        setUploaders={setUploaders}
                    />
                </>
            )}
        </>
    );
}
