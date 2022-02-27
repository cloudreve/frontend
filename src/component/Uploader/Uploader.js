import React, { useCallback, useEffect, useMemo, useState } from "react";
import UploadManager from "./core";
import { useDispatch, useSelector } from "react-redux";
import UploadButton from "../Dial/Create";
import pathHelper from "../../utils/page";
import { useLocation } from "react-router-dom";
import { UploaderError } from "./core/errors";
import { toggleSnackbar } from "../../actions";
import TaskList from "./Popup/TaskList";

export default function Uploader() {
    const [uploaders, setUploaders] = useState([]);
    const [taskListOpen, setTaskListOpen] = useState(false);
    const keywords = useSelector((state) => state.explorer.keywords);
    const policy = useSelector((state) => state.explorer.currentPolicy);
    const isLogin = useSelector((state) => state.viewUpdate.isLogin);
    const path = useSelector((state) => state.navigator.path);
    const location = useLocation();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

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

    const openFileList = () => {
        alert("openFileList");
    };

    const selectFile = () => {
        setTaskListOpen(true);

        // eslint-disable-next-line no-unreachable
        uploadManager
            .select(path)
            .then((tasks) => {
                setTaskListOpen(true);
                setUploaders([...uploaders, ...tasks]);
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

    return (
        <>
            {enableUploader && (
                <>
                    <UploadButton
                        taskListOpen={taskListOpen}
                        selectFile={selectFile}
                        Queued={uploaders.length}
                        openFileList={() => setTaskListOpen(true)}
                    />
                    <TaskList
                        taskList={uploaders}
                        open={taskListOpen}
                        selectFile={selectFile}
                        onClose={() => setTaskListOpen(false)}
                    />
                </>
            )}
        </>
    );
}
