export type PolicyType = "local" | "remote" | "onedrive";

export interface Policy {
    id: number;
    type: PolicyType;
}

export interface Task {
    type: "file" | "folder";
    policy: Policy;
    file?: File;
}
