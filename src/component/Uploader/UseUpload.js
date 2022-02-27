import React, { useEffect, useRef, useState } from "react";
import { Status } from "./core/uploader/base";

export function useUpload(uploader) {
    const startTimeRef = useRef(null);
    const [status, setStatus] = useState(Status.added);
    const [error, setError] = useState(null);
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
            onProgress: () => {},
        });
        /* eslint-enable @typescript-eslint/no-empty-function */
        uploader.start();
    }, []);
    return { status, error };
}
