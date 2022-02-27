export type PolicyType = "local" | "remote" | "onedrive";

export interface Policy {
    id: number;
    name: string;
    allowedSuffix: Nullable<string[]>;
    maxSize: number;
    type: PolicyType;
}

export interface Task {
    type: "file" | "folder";
    policy: Policy;
    file?: File;
}

type Nullable<T> = T | null;
