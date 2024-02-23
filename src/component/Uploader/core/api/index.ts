import {
    OneDriveChunkResponse,
    QiniuChunkResponse,
    QiniuFinishUploadRequest,
    QiniuPartsInfo,
    S3Part,
    UploadCredential,
    UploadSessionRequest,
} from "../types";
import { OBJtoXML, request, requestAPI } from "../utils";
import {
    COSUploadCallbackError,
    COSUploadError,
    CreateUploadSessionError,
    DeleteUploadSessionError,
    HTTPError,
    LocalChunkUploadError,
    OneDriveChunkError,
    OneDriveFinishUploadError,
    QiniuChunkError,
    QiniuFinishUploadError,
    S3LikeChunkError,
    S3LikeFinishUploadError,
    S3LikeUploadCallbackError,
    SlaveChunkUploadError,
    UpyunUploadError,
} from "../errors";
import { ChunkInfo, ChunkProgress } from "../uploader/chunk";
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

    if (res.data.code != 0) {
        throw new CreateUploadSessionError(res.data);
    }

    return res.data.data;
}

export async function deleteUploadSession(id: string): Promise<any> {
    const res = await requestAPI<UploadCredential>(`file/upload/${id}`, {
        method: "delete",
    });

    if (res.data.code != 0) {
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

    if (res.data.code != 0) {
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

    if (res.data.code != 0) {
        throw new SlaveChunkUploadError(res.data, chunk.index);
    }

    return res.data.data;
}

export async function oneDriveUploadChunk(
    url: string,
    range: string, // if range is empty, this will be an request to query the session status
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<OneDriveChunkResponse> {
    const res = await request<OneDriveChunkResponse>(url, {
        method: range === "" ? "get" : "put",
        headers: {
            "content-type": "application/octet-stream",
            ...(range !== "" && { "content-range": range }),
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

    return res.data;
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

    if (res.data.code != 0) {
        throw new OneDriveFinishUploadError(res.data);
    }

    return res.data.data;
}

export async function s3LikeUploadChunk(
    url: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<string> {
    const res = await request<string>(decodeURIComponent(url), {
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
            throw new S3LikeChunkError(e.response.data);
        }

        throw e;
    });

    return res.headers.etag;
}

export async function s3LikeFinishUpload(
    url: string,
    isOss: boolean,
    chunks: ChunkProgress[],
    cancel: CancelToken
): Promise<any> {
    let body = "";
    if (!isOss) {
        body += "<CompleteMultipartUpload>";
        chunks.forEach((chunk) => {
            body += "<Part>";
            const part: S3Part = {
                PartNumber: chunk.index + 1,
                ETag: chunk.etag!,
            };
            body += OBJtoXML(part);
            body += "</Part>";
        });
        body += "</CompleteMultipartUpload>";
    }

    const res = await request<any>(url, {
        method: "post",
        cancelToken: cancel,
        responseType: "document",
        transformResponse: undefined,
        data: body,
        headers: isOss
            ? {
                  "content-type": "application/octet-stream",
                  "x-oss-forbid-overwrite": "true",
                  "x-oss-complete-all": "yes",
              }
            : {
                  "content-type": "application/xhtml+xml",
              },
        validateStatus: function (status) {
            return status == 200;
        },
    }).catch((e) => {
        if (e instanceof HTTPError && e.response) {
            throw new S3LikeFinishUploadError(e.response.data);
        }

        throw e;
    });

    return res.data;
}

export async function qiniuDriveUploadChunk(
    url: string,
    upToken: string,
    chunk: ChunkInfo,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<QiniuChunkResponse> {
    const res = await request<QiniuChunkResponse>(`${url}/${chunk.index + 1}`, {
        method: "put",
        headers: {
            "content-type": "application/octet-stream",
            authorization: "UpToken " + upToken,
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
            throw new QiniuChunkError(e.response.data);
        }

        throw e;
    });

    return res.data;
}

export async function qiniuFinishUpload(
    url: string,
    upToken: string,
    chunks: ChunkProgress[],
    cancel: CancelToken
): Promise<any> {
    const content: QiniuFinishUploadRequest = {
        parts: chunks.map(
            (chunk): QiniuPartsInfo => {
                return {
                    etag: chunk.etag!,
                    partNumber: chunk.index + 1,
                };
            }
        ),
    };

    const res = await request<any>(`${url}`, {
        method: "post",
        headers: {
            "content-type": "application/json",
            authorization: "UpToken " + upToken,
        },
        data: content,
        cancelToken: cancel,
    }).catch((e) => {
        if (e instanceof HTTPError && e.response) {
            throw new QiniuFinishUploadError(e.response.data);
        }

        throw e;
    });

    return res.data;
}

export async function cosFormUploadChunk(
    url: string,
    file: File,
    policy: string,
    path: string,
    callback: string,
    sessionID: string,
    keyTime: string,
    credential: string,
    ak: string,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.append("policy", policy);
    bodyFormData.append("key", path);
    bodyFormData.append("x-cos-meta-callback", callback);
    bodyFormData.append("x-cos-meta-key", sessionID);
    bodyFormData.append("q-sign-algorithm", "sha1");
    bodyFormData.append("q-key-time", keyTime);
    bodyFormData.append("q-ak", ak);
    bodyFormData.append("q-signature", credential);
    bodyFormData.append("name", file.name);
    // File must be the last element in the form
    bodyFormData.append("file", file);

    const res = await request<any>(`${url}`, {
        method: "post",
        headers: {
            "content-type": "multipart/form-data",
        },
        data: bodyFormData,
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
            throw new COSUploadError(e.response.data);
        }

        throw e;
    });

    return res.data;
}

export async function cosUploadCallback(
    sessionID: string,
    cancel: CancelToken
): Promise<any> {
    const res = await requestAPI<any>(`callback/cos/${sessionID}`, {
        method: "get",
        data: "{}",
        cancelToken: cancel,
    });

    if (res.data.code != 0) {
        throw new COSUploadCallbackError(res.data);
    }

    return res.data.data;
}

export async function upyunFormUploadChunk(
    url: string,
    file: File,
    policy: string,
    credential: string,
    onProgress: (p: Progress) => void,
    cancel: CancelToken
): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.append("policy", policy);
    bodyFormData.append("authorization", credential);
    // File must be the last element in the form
    bodyFormData.append("file", file);

    const res = await request<any>(`${url}`, {
        method: "post",
        headers: {
            "content-type": "multipart/form-data",
        },
        data: bodyFormData,
        onUploadProgress: (progressEvent) => {
            onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
            });
        },
        cancelToken: cancel,
    }).catch((e) => {
        if (e instanceof HTTPError && e.response) {
            throw new UpyunUploadError(e.response.data);
        }

        throw e;
    });

    return res.data;
}

export async function s3LikeUploadCallback(
    sessionID: string,
    cancel: CancelToken
): Promise<any> {
    const res = await requestAPI<any>(`callback/s3/${sessionID}`, {
        method: "get",
        data: "{}",
        cancelToken: cancel,
    });

    if (res.data.code != 0) {
        throw new S3LikeUploadCallbackError(res.data);
    }

    return res.data.data;
}
