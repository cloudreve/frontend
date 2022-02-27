import { UploadCredential, UploadSessionRequest } from "../types";
import { requestAPI } from "../utils";
import { CreateUploadSessionError, LocalChunkUploadError } from "../errors";
import { ChunkInfo } from "../uploader/chunk";
import { Progress } from "../uploader/base";

export async function createUploadSession(
    req: UploadSessionRequest
): Promise<UploadCredential> {
    const res = await requestAPI<UploadCredential>("file/upload", {
        method: "put",
        data: req,
    });

    if (res.data.code !== 0) {
        throw new CreateUploadSessionError(res.data);
    }

    return res.data.data;
}

export async function loadUploadChunk(
    sessionID: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void
): Promise<any> {
    const res = await requestAPI<any>(
        `file/upload/${sessionID}/${chunk.index}`,
        {
            method: "post",
            headers: { "content-type": "application/octet-stream" },
            data: chunk.chunk,
            onUploadProgress: (progressEvent) => {
                onProgress({
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                });
            },
        }
    );

    if (res.data.code !== 0) {
        throw new LocalChunkUploadError(res.data, chunk.index);
    }

    return res.data.data;
}
