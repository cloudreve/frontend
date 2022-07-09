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

// path: a/b/c
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

// path: a/b/c.jpg
export const saveFileToFileSystemDirectory = async (
    handle: FileSystemDirectoryHandle,
    stream: Blob,
    path: string
) => {
    const paths = path.split("/");
    const fileName = paths.pop();
    if (!fileName) return;

    const dir = await createFileSystemDirectory(handle, paths);
    const file = await dir.getFileHandle(fileName, { create: true });
    const writable = await file.createWritable();
    await writable.write(stream);
    await writable.close();
};