import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const paginate = (array, page_size, page_number) =>
    page_size === -1
        ? array
        : array.slice((page_number - 1) * page_size, page_number * page_size);

export function usePagination() {
    const files = useSelector((state) => state.explorer.fileList);
    const folders = useSelector((state) => state.explorer.dirList);
    const pagination = useSelector((state) => state.viewUpdate.pagination);

    const { dirList, fileList, startIndex } = useMemo(() => {
        const all = paginate(
            [...folders, ...files],
            pagination.size,
            pagination.page
        );
        const dirList = [];
        const fileList = [];
        all.forEach((v) =>
            v.type === "dir" ? dirList.push(v) : fileList.push(v)
        );
        const startIndex = pagination.size * (pagination.page - 1);
        return { dirList, fileList, startIndex };
    }, [folders, files, pagination]);
    return { dirList, fileList, startIndex };
}
