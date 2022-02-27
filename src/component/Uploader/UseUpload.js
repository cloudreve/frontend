import React, { useEffect, useRef, useState } from "react";
import { Status } from "./core/uploader/base";

export function useUpload(uploader) {
    const startTimeRef = useRef(null);
    const [state, setState] = useState(Status.added);
    useEffect(() => {
        startTimeRef.current = Date.now();
        uploader.start();
    }, []);
}
