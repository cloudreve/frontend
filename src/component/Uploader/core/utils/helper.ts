export const sizeToString = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

// 文件分块
export function getChunks(
    file: File,
    chunkByteSize: number | undefined
): Blob[] {
    // 如果 chunkByteSize 比文件大或为0，则直接取文件的大小
    if (!chunkByteSize || chunkByteSize > file.size || chunkByteSize == 0) {
        chunkByteSize = file.size;
    }

    const chunks: Blob[] = [];
    const count = Math.ceil(file.size / chunkByteSize);
    for (let i = 0; i < count; i++) {
        const chunk = file.slice(
            chunkByteSize * i,
            i === count - 1 ? file.size : chunkByteSize * (i + 1)
        );
        chunks.push(chunk);
    }
    return chunks;
}

export function sum(list: number[]) {
    return list.reduce((data, loaded) => data + loaded, 0);
}
