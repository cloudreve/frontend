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
    file?: File;
    child?: Task[];
}

type Nullable<T> = T | null;
