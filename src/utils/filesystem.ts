// get the paths of files (no directories) in the directory
// parent: "" or "/"
export const getFileSystemDirectoryPaths = async (
    handle: FileSystemDirectoryHandle,
    parent = ""
): Promise<string[]> => {
    const paths: Array<string> = [];

    for await (const [path, fileSystemHandle] of handle.entries()) {
        if (fileSystemHandle instanceof window.FileSystemFileHandle) {
            paths.push(`${parent}${path}`);
        } else {
            paths.push(
                ...(await getFileSystemDirectoryPaths(
                    fileSystemHandle,
                    `${parent}${path}/`
                ))
            );
        }
    }

    return paths;
};

// create the dst directory if it doesn't exist
// return the dst directory handle
// paths: "/dir1/dir2" => ["dir1","dir2"]
export const createFileSystemDirectory = async (
    handle: FileSystemDirectoryHandle,
    paths: string[]
) => {
    let cur = handle;
    while (paths.length > 0) {
        const path = paths.shift();
        if (!path) {
            break;
        }
        cur = await cur.getDirectoryHandle(path, { create: true });
    }
    return cur;
};

// save file into the dst directory
// create the dst file if it doesn't exist by default
// path: a/b/c.jpg
export const saveFileToFileSystemDirectory = async (
    handle: FileSystemDirectoryHandle,
    stream: FileSystemWriteChunkType,
    path: string,
    create = true
) => {
    const paths = path.split("/");
    const fileName = paths.pop();
    if (!fileName) return;

    const dir = await createFileSystemDirectory(handle, paths);
    const file = await dir.getFileHandle(fileName, { create });
    const writable = await file.createWritable();
    await writable.write(stream);
    await writable.close();
};

// verify or request the permission of the readwrite permission
export async function verifyFileSystemRWPermission(
    fileHandle: FileSystemDirectoryHandle
) {
    const opts = { mode: "readwrite" as FileSystemPermissionMode };

    // Check if we already have permission, if so, return true.
    if ((await fileHandle.queryPermission(opts)) === "granted") {
        return true;
    }

    // Request permission to the file, if the user grants permission, return true.
    if ((await fileHandle.requestPermission(opts)) === "granted") {
        return true;
    }

    // The user did not grant permission, return false.
    return false;
}
