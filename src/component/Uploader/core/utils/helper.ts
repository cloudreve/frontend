import { Task } from "../types";
import Logger from "../logger";
import { UploaderError, UploaderErrorName } from "../errors";
import { ChunkProgress } from "../uploader/chunk";

export const sizeToString = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

// 文件分块
export function getChunks(
    file: File,
    chunkByteSize: number | undefined
): Blob[] {
    // 如果 chunkByteSize 比文件大或为0，则直接取文件的大小
    if (!chunkByteSize || chunkByteSize > file.size || chunkByteSize == 0) {
        chunkByteSize = file.size;
    }

    const chunks: Blob[] = [];
    const count = Math.ceil(file.size / chunkByteSize);
    for (let i = 0; i < count; i++) {
        const chunk = file.slice(
            chunkByteSize * i,
            i === count - 1 ? file.size : chunkByteSize * (i + 1)
        );
        chunks.push(chunk);
    }

    if (chunks.length == 0) {
        chunks.push(file.slice(0));
    }
    return chunks;
}

export function sumChunk(list: ChunkProgress[]) {
    return list.reduce((data, loaded) => data + loaded.loaded, 0);
}

const resumeKeyPrefix = "cd_upload_ctx_";

export function getResumeCtxKey(task: Task): string {
    return `${resumeKeyPrefix}name_${task.file.name}_dst_${task.dst}_size_${task.file.size}_policy_${task.policy.id}`;
}

export function setResumeCtx(task: Task, logger: Logger) {
    const ctxKey = getResumeCtxKey(task);
    try {
        localStorage.setItem(ctxKey, JSON.stringify(task));
    } catch (err) {
        logger.warn(
            new UploaderError(
                UploaderErrorName.WriteCtxFailed,
                `setResumeCtx failed: ${ctxKey}`
            )
        );
    }
}

export function removeResumeCtx(task: Task, logger: Logger) {
    const ctxKey = getResumeCtxKey(task);
    try {
        localStorage.removeItem(ctxKey);
    } catch (err) {
        logger.warn(
            new UploaderError(
                UploaderErrorName.RemoveCtxFailed,
                `removeResumeCtx failed. key: ${ctxKey}`
            )
        );
    }
}

export function cleanupResumeCtx(logger: Logger) {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(resumeKeyPrefix)) {
            try {
                localStorage.removeItem(key);
            } catch (err) {
                logger.warn(
                    new UploaderError(
                        UploaderErrorName.RemoveCtxFailed,
                        `removeResumeCtx failed. key: ${key}`
                    )
                );
            }
        }
    }
}

export function getResumeCtx(task: Task, logger: Logger): Task | null {
    const ctxKey = getResumeCtxKey(task);
    let localInfoString: string | null = null;
    try {
        localInfoString = localStorage.getItem(ctxKey);
    } catch {
        logger.warn(
            new UploaderError(
                UploaderErrorName.ReadCtxFailed,
                `getResumeCtx failed. key: ${ctxKey}`
            )
        );
    }

    if (localInfoString == null) {
        return null;
    }

    let localInfo: Task | null = null;
    try {
        localInfo = JSON.parse(localInfoString);
    } catch {
        // 本地信息已被破坏，直接删除
        removeResumeCtx(task, logger);
        logger.warn(
            new UploaderError(
                UploaderErrorName.InvalidCtxData,
                `getResumeCtx failed to parse. key: ${ctxKey}`
            )
        );
    }

    if (
        localInfo &&
        localInfo.session &&
        localInfo.session.expires < Math.floor(Date.now() / 1000)
    ) {
        removeResumeCtx(task, logger);
        logger.warn(
            new UploaderError(
                UploaderErrorName.CtxExpired,
                `upload session already expired at ${localInfo.session.expires}. key: ${ctxKey}`
            )
        );
        return null;
    }

    return localInfo;
}

export function OBJtoXML(obj: any): string {
    let xml = "";
    for (const prop in obj) {
        xml += "<" + prop + ">";
        if (Array.isArray(obj[prop])) {
            for (const array of obj[prop]) {
                // A real botch fix here
                xml += "</" + prop + ">";
                xml += "<" + prop + ">";

                xml += OBJtoXML(new Object(array));
            }
        } else if (typeof obj[prop] == "object") {
            xml += OBJtoXML(new Object(obj[prop]));
        } else {
            xml += obj[prop];
        }
        xml += "</" + prop + ">";
    }
    return xml.replace(/<\/?[0-9]{1,}>/g, "");
}
