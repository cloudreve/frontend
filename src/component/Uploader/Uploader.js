import React, { useCallback, useEffect, useMemo, useState } from "react";
import UploadManager from "./core";
import { useDispatch, useSelector } from "react-redux";
import UploadButton from "../Dial/Create";
import pathHelper from "../../utils/page";
import { useLocation } from "react-router-dom";
import { UploaderError } from "./core/errors";
import { refreshFileList, toggleSnackbar } from "../../actions";
import TaskList from "./Popup/TaskList";
import { Status } from "./core/uploader/base";

let totalProgressCollector = null;
let lastProgressStart = -1;

export default function Uploader() {
    const [uploaders, setUploaders] = useState([]);
    const [taskListOpen, setTaskListOpen] = useState(false);
    const [totalProgress, setTotalProgress] = useState({
        totalSize: 0,
        processedSize: 0,
        total: 0,
        processed: 0,
    });
    const keywords = useSelector((state) => state.explorer.keywords);
    const policy = useSelector((state) => state.explorer.currentPolicy);
    const isLogin = useSelector((state) => state.viewUpdate.isLogin);
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

    const enableUploader = useMemo(
        () =>
            pathHelper.isHomePage(location.pathname) &&
            isLogin &&
            keywords === "",
        [location.pathname, isLogin, keywords]
    );

    const uploadManager = useMemo(() => {
        return new UploadManager({
            logLevel: "INFO",
            concurrentLimit: 5,
        });
    }, []);

    useEffect(() => {
        uploadManager.setPolicy(policy);
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

                        if (
                            u.status === Status.finished ||
                            u.status === Status.canceled ||
                            u.status === Status.error
                        ) {
                            progress.totalSize += u.task.size;
                            progress.total += 1;
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
                            progress.totalSize += u.task.size;
                            progress.total += 1;
                            progress.processedSize += u.progress
                                ? u.progress.total.loaded
                                : 0;
                        }

                        if (progress.processed === progress.total) {
                            lastProgressStart = u.id;
                        }
                    });
                    return uploaders;
                });

                if (
                    progress.total > 0 &&
                    progress.total === progress.processed
                ) {
                    RefreshFileList();
                }

                setTotalProgress(progress);
            }, 2000);
        }
    }, []);

    const openFileList = () => {
        alert("openFileList");
    };

    const selectFile = (path, original = null) => {
        setTaskListOpen(true);

        // eslint-disable-next-line no-unreachable
        uploadManager
            .select(path)
            .then((tasks) => {
                if (original !== null) {
                    if (
                        tasks.length !== 1 ||
                        tasks[0].key() !== original.key()
                    ) {
                        ToggleSnackbar(
                            "top",
                            "right",
                            "所选择文件与原始文件不符",
                            "warning"
                        );
                        return;
                    }
                }

                tasks.forEach((t) => t.start());

                setTaskListOpen(true);
                setUploaders((uploaders) => {
                    if (original !== null) {
                        uploaders = uploaders.filter(
                            (u) => u.key() !== original.key()
                        );
                    }

                    return [...uploaders, ...tasks];
                });
            })
            .catch((e) => {
                if (e instanceof UploaderError) {
                    ToggleSnackbar("top", "right", e.Message(""), "warning");
                } else {
                    ToggleSnackbar(
                        "top",
                        "right",
                        "出现未知错误：" + e.message,
                        "error"
                    );
                }
            });
    };

    const deleteTask = (filter) => {
        setUploaders((uploaders) => uploaders.filter(filter));
    };

    return (
        <>
            {enableUploader && (
                <>
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
                    />
                </>
            )}
        </>
    );
}
