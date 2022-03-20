import {
    OneDriveChunkResponse,
    UploadCredential,
    UploadSessionRequest,
} from "../types";
import { request, requestAPI } from "../utils";
import {
    CreateUploadSessionError,
    DeleteUploadSessionError,
    HTTPError,
    LocalChunkUploadError,
    OneDriveChunkError,
    OneDriveFinishUploadError,
    OSSChunkError,
    OSSFinishUploadError,
    SlaveChunkUploadError,
} from "../errors";
import { ChunkInfo } from "../uploader/chunk";
import { Progress } from "../uploader/base";
import { CancelToken } from "axios";

export async function createUploadSession(
    req: UploadSessionRequest,
    cancel: CancelToken
): Promise<UploadCredential> {
    const res = await requestAPI<UploadCredential>("file/upload", {
        method: "put",
        data: req,
        cancelToken: cancel,
    });

    if (res.data.code !== 0) {
        throw new CreateUploadSessionError(res.data);
    }

    return res.data.data;
}

export async function deleteUploadSession(id: string): Promise<any> {
    const res = await requestAPI<UploadCredential>(`file/upload/${id}`, {
        method: "delete",
    });

    if (res.data.code !== 0) {
        throw new DeleteUploadSessionError(res.data);
    }

    return res.data.data;
}

export async function localUploadChunk(
    sessionID: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
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
            cancelToken: cancel,
        }
    );

    if (res.data.code !== 0) {
        throw new LocalChunkUploadError(res.data, chunk.index);
    }

    return res.data.data;
}

export async function slaveUploadChunk(
    url: string,
    credential: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<any> {
    const res = await request<any>(`${url}?chunk=${chunk.index}`, {
        method: "post",
        headers: {
            "content-type": "application/octet-stream",
            Authorization: credential,
        },
        data: chunk.chunk,
        onUploadProgress: (progressEvent) => {
            onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
            });
        },
        cancelToken: cancel,
    });

    if (res.data.code !== 0) {
        throw new SlaveChunkUploadError(res.data, chunk.index);
    }

    return res.data.data;
}

export async function oneDriveUploadChunk(
    url: string,
    range: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<OneDriveChunkResponse> {
    const res = await request<OneDriveChunkResponse>(url, {
        method: "put",
        headers: {
            "content-type": "application/octet-stream",
            "content-range": range,
        },
        data: chunk.chunk,
        onUploadProgress: (progressEvent) => {
            onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
            });
        },
        cancelToken: cancel,
    }).catch((e) => {
        if (e instanceof HTTPError && e.response) {
            throw new OneDriveChunkError(e.response.data);
        }

        throw e;
    });

    return res.data.data;
}

export async function finishOneDriveUpload(
    sessionID: string,
    cancel: CancelToken
): Promise<UploadCredential> {
    const res = await requestAPI<UploadCredential>(
        `callback/onedrive/finish/${sessionID}`,
        {
            method: "post",
            data: "{}",
            cancelToken: cancel,
        }
    );

    if (res.data.code !== 0) {
        throw new OneDriveFinishUploadError(res.data);
    }

    return res.data.data;
}

export async function ossDriveUploadChunk(
    url: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<any> {
    const res = await request<any>(url, {
        method: "put",
        headers: {
            "content-type": "application/octet-stream",
        },
        data: chunk.chunk,
        onUploadProgress: (progressEvent) => {
            onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
            });
        },
        cancelToken: cancel,
        responseType: "document",
        transformResponse: undefined,
    }).catch((e) => {
        if (e instanceof HTTPError && e.response) {
            throw new OSSChunkError(e.response.data);
        }

        throw e;
    });

    return res.data;
}

export async function ossFinishUpload(
    url: string,
    cancel: CancelToken
): Promise<any> {
    const res = await request<any>(url, {
        method: "post",
        cancelToken: cancel,
        responseType: "document",
        transformResponse: undefined,
        headers: {
            "content-type": "application/octet-stream",
            "x-oss-forbid-overwrite": "true",
            "x-oss-complete-all": "yes",
        },
        validateStatus: function (status) {
            return status == 200;
        },
    }).catch((e) => {
        if (e instanceof HTTPError && e.response) {
            throw new OSSFinishUploadError(e.response.data);
        }

        throw e;
    });

    return res.data;
}
