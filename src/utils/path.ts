import { CloudreveFile } from "../types";

export function filePath(file: CloudreveFile): string {
    return file.path === "/"
        ? file.path + file.name
        : file.path + "/" + file.name;
}
