import React, { useEffect, useMemo, useState } from "react";
import UploadManager from "./core";
import { useSelector } from "react-redux";
import UploadButton from "../Dial/Create";
import Auth from "../../middleware/Auth";

export default function Uploader() {
    const [uploadTasks, setUploadTasks] = useState([]);
    const keywords = useSelector((state) => state.explorer.keywords);
    const policy = useSelector((state) => state.explorer.currentPolicy);
    const user = Auth.GetUser();

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

    return (
        <>
            {keywords === "" && (
                <UploadButton
                    openFileSelector={uploadManager.openFileSelector}
                    Queued={uploadTasks.length}
                    openFileList={openFileList}
                />
            )}
        </>
    );
}
