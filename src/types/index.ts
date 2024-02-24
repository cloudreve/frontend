export interface CloudreveFile {
    id: string;
    name: string;
    size: number;
    date: string;
    create_date: string;
    path: string;
    type: "up" | "file" | "dir";
    source_enabled?: boolean;
}

export type SortMethod =
    | "sizePos"
    | "sizeRes"
    | "namePos"
    | "nameRev"
    | "timePos"
    | "timeRev"
    | "modifyTimePos"
    | "modifyTimeRev";

export enum BatchDownloadMethod {
    ClientStream,
    ServerArchive,
}

declare global {
    interface Window {
        baseConfig?: (f: (response: any, e: any) => any) => any;
    }
}
