import React, { useEffect, useRef, useState } from "react";
import { Status } from "./core/uploader/base";

export function useUpload(uploader) {
    const startTimeRef = useRef(null);
    const [status, setStatus] = useState(uploader.status);
    const [error, setError] = useState(uploader.error);
    useEffect(() => {
        startTimeRef.current = Date.now();
        /* eslint-disable @typescript-eslint/no-empty-function */
        uploader.subscribe({
            onTransition: (newStatus) => {
                setStatus(newStatus);
            },
            onError: (err) => {
                setError(err);
                setStatus(uploader.status);
            },
            onProgress: (data) => {},
        });
        /* eslint-enable @typescript-eslint/no-empty-function */
        if (status === Status.added) {
            uploader.start();
        }
    }, []);
    return { status, error };
}
