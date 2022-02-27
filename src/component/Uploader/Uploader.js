import React, { useCallback, useEffect, useMemo, useState } from "react";
import UploadManager from "./core";
import { useDispatch, useSelector } from "react-redux";
import UploadButton from "../Dial/Create";
import pathHelper from "../../utils/page";
import { useLocation } from "react-router-dom";
import { UploaderError } from "./core/errors";
import { toggleSnackbar } from "../../actions";

export default function Uploader() {
    const [uploadTasks, setUploadTasks] = useState([]);
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
        });
    }, []);

    useEffect(() => {
        uploadManager.setPolicy(policy);
    }, [policy]);

    const openFileList = () => {
        alert("openFileList");
    };

    const selectFile = () => {
        uploadManager
            .select(path)
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
            })
            .then((uploaders) => {
                alert("success");
                console.log(uploaders);
            });
    };

    return (
        <>
            {enableUploader && (
                <UploadButton
                    selectFile={selectFile}
                    Queued={uploadTasks.length}
                    openFileList={openFileList}
                />
            )}
        </>
    );
}
