import { ChunkProgress } from "./uploader/chunk";

export enum PolicyType {
    local = "local",
    remote = "remote",
    oss = "oss",
    qiniu = "qiniu",
    onedrive = "onedrive",
    cos = "cos",
    upyun = "upyun",
    s3 = "s3",
}

export interface Policy {
    id: number;
    name: string;
    allowedSuffix: Nullable<string[]>;
    maxSize: number;
    type: PolicyType;
}

export enum TaskType {
    file,
    resumeHint,
}

export interface Task {
    type: TaskType;
    name: string;
    size: number;
    policy: Policy;
    dst: string;
    file: File;
    child?: Task[];
    session?: UploadCredential;
    chunkProgress: ChunkProgress[];
    resumed: boolean;
}

type Nullable<T> = T | null;

export interface Response<T> {
    code: number;
    data: T;
    msg: string;
    error: string;
}

export interface UploadSessionRequest {
    path: string;
    size: number;
    name: string;
    policy_id: number;
    last_modified?: number;

    mime_type?: string;
}

export interface UploadCredential {
    sessionID: string;
    expires: number;
    chunkSize: number;
    uploadURLs: string[];
    credential: string;
    uploadID: string;
    callback: string;
    policy: string;
    ak: string;
    keyTime: string;
    path: string;
    completeURL: string;
}

export interface OneDriveError {
    error: {
        code: string;
        message: string;
        innererror?: {
            code: string;
        };
        retryAfterSeconds?: number;
    };
}

export interface OneDriveChunkResponse {
    expirationDateTime: string;
    nextExpectedRanges: string[];
}

export interface QiniuChunkResponse {
    etag: string;
    md5: string;
}

export interface QiniuError {
    error: string;
}

export interface QiniuPartsInfo {
    etag: string;
    partNumber: number;
}

export interface QiniuFinishUploadRequest {
    parts: QiniuPartsInfo[];
}

export interface UpyunError {
    message: string;
    code: number;
}

export interface S3Part {
    ETag: string;
    PartNumber: number;
}
