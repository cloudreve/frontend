import { ChunkProgress } from "./uploader/chunk";

export enum PolicyType {
    local = "local",
    remote = "remote",
    oss = "oss",
    qiniu = "qiniu",
    onedrive = "onedrive",
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
    folder,
}

export interface Task {
    type: TaskType;
    name: string;
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
}

export interface UploadCredential {
    sessionID: string;
    expires: number;
    chunkSize: number;
    uploadURLs: string[];
    credential: string;
    uploadID: string;
    callback: string;
}

export interface OneDriveError {
    error: {
        code: string;
        message: string;
        innererror?: {
            code: string;
        };
    };
}

export interface OneDriveChunkResponse {
    expirationDateTime: string;
    nextExpectedRanges: string[];
}
