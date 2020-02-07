export const navitateTo = path => {
    return {
        type: "NAVIGATOR_TO",
        path: path
    };
};

export const navitateUp = () => {
    return {
        type: "NAVIGATOR_UP"
    };
};

export const drawerToggleAction = open => {
    return {
        type: "DRAWER_TOGGLE",
        open: open
    };
};

export const dragAndDrop = (source,target) => {
    return {
        type: "DRAG_AND_DROP",
        source: source,
        target: target,
    };
};

export const changeViewMethod = method => {
    return {
        type: "CHANGE_VIEW_METHOD",
        method: method
    };
};

export const changeSubTitle = title =>{
    return {
        type: "CHANGE_SUB_TITLE",
        title: title
    };
};

export const toggleDaylightMode = ()=>{
    return {
        type: "TOGGLE_DAYLIGHT_MODE",
    };
};

export const changeSortMethod = method => {
    return {
        type: "CHANGE_SORT_METHOD",
        method: method
    };
};

export const updateFileList = list => {
    return {
        type: "UPDATE_FILE_LIST",
        list: list
    };
};

export const changeContextMenu = (type, open) => {
    return {
        type: "CHANGE_CONTEXT_MENU",
        menuType: type,
        open: open
    };
};

export const addSelectedTarget = targets => {
    return {
        type: "ADD_SELECTED_TARGET",
        targets: targets
    };
};

export const setSelectedTarget = targets => {
    return {
        type: "SET_SELECTED_TARGET",
        targets: targets
    };
};

export const removeSelectedTarget = id => {
    return {
        type: "RMOVE_SELECTED_TARGET",
        id: id
    };
};

export const setNavigatorLoadingStatus = status => {
    return {
        type: "SET_NAVIGATOR_LOADING_STATUE",
        status: status
    };
};

export const setNavigatorError = (status, msg) => {
    return {
        type: "SET_NAVIGATOR_ERROR",
        status: status,
        msg: msg
    };
};

export const openCreateFolderDialog = () => {
    return {
        type: "OPEN_CREATE_FOLDER_DIALOG"
    };
};

export const setUserPopover = anchor => {
    return {
        type: "SET_USER_POPOVER",
        anchor: anchor
    };
};

export const setShareUserPopover = anchor => {
    return {
        type: "SET_SHARE_USER_POPOVER",
        anchor: anchor
    };
};

export const openRenameDialog = () => {
    return {
        type: "OPEN_RENAME_DIALOG"
    };
};

export const openResaveDialog = (key) => {
    return {
        type: "OPEN_RESAVE_DIALOG",
        key:key,
    };
};

export const openMoveDialog = () => {
    return {
        type: "OPEN_MOVE_DIALOG"
    };
};

export const openRemoveDialog = () => {
    return {
        type: "OPEN_REMOVE_DIALOG"
    };
};

export const openShareDialog = () => {
    return {
        type: "OPEN_SHARE_DIALOG"
    };
};

export const applyThemes = (theme)=>{
    return {
        type:'APPLY_THEME',
        theme:theme,
    };
};

export const setSessionStatus = (status)=>{
    return {
        type:'SET_SESSION_STATUS',
        status:status,
    };
};


export const openMusicDialog = () => {
    return {
        type: "OPEN_MUSIC_DIALOG"
    };
};

export const openRemoteDownloadDialog = () => {
    return {
        type: "OPEN_REMOTE_DOWNLOAD_DIALOG"
    };
};

export const openTorrentDownloadDialog = () => {
    return {
        type: "OPEN_TORRENT_DOWNLOAD_DIALOG"
    };
};

export const openDecompressDialog = () => {
    return {
        type: "OPEN_DECOMPRESS_DIALOG"
    };
};

export const openCompressDialog = () => {
    return {
        type: "OPEN_COMPRESS_DIALOG"
    };
};

export const openGetSourceDialog = () => {
    return {
        type: "OPEN_GET_SOURCE_DIALOG"
    };
};

export const openCopyDialog = () => {
    return {
        type: "OPEN_COPY_DIALOG"
    };
};

export const openLoadingDialog = (text) => {
    return {
        type: "OPEN_LOADING_DIALOG",
        text: text,
    }
};

export const closeAllModals = () => {
    return {
        type: "CLOSE_ALL_MODALS"
    };
};

export const toggleSnackbar = (vertical, horizontal, msg, color) => {
    return {
        type: "TOGGLE_SNACKBAR",
        vertical: vertical,
        horizontal: horizontal,
        msg: msg,
        color: color
    };
};

export const enableLoadUploader = () => {
    return {
        type: "ENABLE_LOAD_UPLOADER"
    };
};

export const setModalsLoading = status => {
    return {
        type: "SET_MODALS_LOADING",
        status: status
    };
};

export const refreshFileList = () => {
    return {
        type: "REFRESH_FILE_LIST"
    };
};

export const searchMyFile = keywords => {
    return {
        type: "SEARCH_MY_FILE",
        keywords: keywords
    };
};

export const showImgPreivew = first => {
    return {
        type: "SHOW_IMG_PREIVEW",
        first: first
    };
};

export const refreshStorage = () => {
    return {
        type: "REFRESH_STORAGE"
    };
};

export const saveFile = () => {
    return {
        type: "SAVE_FILE"
    };
};

export const setSiteConfig = config => {
    return {
        type: "SET_SITE_CONFIG",
        config: config
    };
};
