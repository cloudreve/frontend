export enum PolicyType {
    local = "local",
    remote = "remote",
}

export interface Policy {
    id: number;
    name: string;
    allowedSuffix: Nullable<string[]>;
    maxSize: number;
    type: PolicyType;
    chunkSize: number;
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
}
