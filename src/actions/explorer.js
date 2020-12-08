import { isMac } from "../utils";

export const removeSelectedTargets = fileIds => {
    return {
        type: "RMOVE_SELECTED_TARGETS",
        fileIds
    };
};

export const addSelectedTargets = targets => {
    return {
        type: "ADD_SELECTED_TARGETS",
        targets
    };
};

export const setSelectedTarget = targets => {
    return {
        type: "SET_SELECTED_TARGET",
        targets
    };
};

export const setLastSelect = (file, index) => {
    return {
        type: "SET_LAST_SELECT",
        file,
        index
    };
};

export const setShiftSelectedIds = shiftSelectedIds => {
    return {
        type: "SET_SHIFT_SELECTED_IDS",
        shiftSelectedIds
    };
};

export const selectFile = (file, event, fileIndex) => {
    const { ctrlKey, metaKey, shiftKey } = event;
    return (dispatch, getState) => {
        // 多种组合操作忽略
        if ([ctrlKey, metaKey, shiftKey].filter(Boolean).length > 1) {
            return;
        }
        const isMacbook = isMac();
        const { explorer } = getState();
        const { selected, lastSelect, dirList, fileList } = explorer;
        if (
            shiftKey &&
            !ctrlKey &&
            !metaKey &&
            selected.length !== 0 &&
            // 点击类型一样
            file.type === lastSelect.file.type
        ) {
            // shift 多选
            // 取消原有选择
            dispatch(removeSelectedTargets(selected.map(v => v.id)));
            // 添加新选择
            const begin = Math.min(lastSelect.index, fileIndex);
            const end = Math.max(lastSelect.index, fileIndex);
            const list = file.type === "dir" ? dirList : fileList;
            const newShiftSelected = list.slice(begin, end + 1);
            return dispatch(addSelectedTargets(newShiftSelected));
        }
        dispatch(setLastSelect(file, fileIndex));
        dispatch(setShiftSelectedIds([]));
        if ((ctrlKey && !isMacbook) || (metaKey && isMacbook)) {
            // Ctrl/Command 单击添加/删除
            const presentIndex = selected.findIndex(value => {
                return value.id === file.id;
            });
            if (presentIndex !== -1) {
                return dispatch(removeSelectedTargets([file.id]));
            }
            return dispatch(addSelectedTargets([file]));
        }
        // 单选
        return dispatch(setSelectedTarget([file]));
    };
};
