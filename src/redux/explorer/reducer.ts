/* eslint-disable no-case-declarations */
import { AnyAction } from "redux";
import { CloudreveFile } from "../../types";
import { Policy } from "../../component/Uploader/core/types";

interface SelectProps {
    isMultiple: boolean;
    withFolder: boolean;
    withFile: boolean;
    withSourceEnabled: boolean;
}

export interface ExplorerState {
    dndSignal: boolean;
    dndTarget: any;
    dndSource: any;
    fileList: CloudreveFile[];
    dirList: CloudreveFile[];
    selected: CloudreveFile[];
    selectProps: SelectProps;
    lastSelect: {
        file: CloudreveFile;
        index: number;
    };
    shiftSelectedIds: string[];
    imgPreview: {
        first: CloudreveFile;
        other: [];
    };
    audioPreview: {
        first: CloudreveFile;
        other: [];
        playingName: any;
        paused: boolean;
        isOpen: boolean;
    };
    search?: {
        keywords: string;
        searchPath: string;
    };
    fileSave: boolean;
    sideBarOpen: boolean;
    currentPolicy?: Policy;
    purchase?: {
        callback: any;
        onClose: any;
        score: number;
    };
}

export const initState: ExplorerState = {
    dndSignal: false,
    dndTarget: null,
    dndSource: null,
    fileList: [],
    dirList: [],
    selected: [],
    selectProps: {
        isMultiple: false,
        withFolder: false,
        withFile: false,
        withSourceEnabled: false,
    },
    lastSelect: {
        file: {
            id: "",
            name: "",
            size: 0,
            type: "file",
            date: "",
            path: "",
            create_date: "",
        },
        index: -1,
    },
    shiftSelectedIds: [],
    imgPreview: {
        first: {
            id: "",
            name: "",
            size: 0,
            type: "file",
            date: "",
            path: "",
            create_date: "",
        },
        other: [],
    },
    audioPreview: {
        first: {
            id: "",
            name: "",
            size: 0,
            type: "file",
            date: "",
            path: "",
            create_date: "",
        },
        other: [],
        playingName: null,
        paused: false,
        isOpen: false,
    },
    fileSave: false,
    sideBarOpen: false,
};

const checkSelectedProps = (selected: CloudreveFile[]): SelectProps => {
    const isMultiple = selected.length > 1;
    let withFolder = false;
    let withFile = false;
    let withSourceEnabled = false;
    selected.forEach((value) => {
        if (value.type === "dir") {
            withFolder = true;
            withSourceEnabled = true;
        } else if (value.type === "file") {
            withFile = true;
            if (value.source_enabled) {
                withSourceEnabled = true;
            }
        }
    });
    return {
        isMultiple,
        withFolder,
        withFile,
        withSourceEnabled,
    };
};

const explorer = (
    state: ExplorerState = initState,
    action: AnyAction
): ExplorerState => {
    switch (action.type) {
        case "DRAG_AND_DROP":
            return Object.assign({}, state, {
                dndSignal: !state.dndSignal,
                dndTarget: action.target,
                dndSource: action.source,
            });
        case "SET_FILE_LIST":
            return Object.assign({}, state, {
                fileList: action.list,
            });
        case "SET_DIR_LIST":
            return Object.assign({}, state, {
                dirList: action.list,
            });
        case "ADD_SELECTED_TARGETS":
            const addedSelected = [...state.selected, ...action.targets];
            return Object.assign({}, state, {
                selected: addedSelected,
                selectProps: checkSelectedProps(addedSelected),
            });
        case "SET_SELECTED_TARGET":
            const newSelected = action.targets;
            return Object.assign({}, state, {
                selected: newSelected,
                selectProps: checkSelectedProps(newSelected),
            });
        case "RMOVE_SELECTED_TARGETS":
            const { fileIds } = action;
            const filteredSelected = state.selected.filter((file) => {
                return !fileIds.includes(file.id);
            });
            return Object.assign({}, state, {
                selected: filteredSelected,
                selectProps: checkSelectedProps(filteredSelected),
            });
        case "REFRESH_FILE_LIST":
            return Object.assign({}, state, {
                selected: [],
                selectProps: {
                    isMultiple: false,
                    withFolder: false,
                    withFile: false,
                    withSourceEnabled: false,
                },
            });
        case "SEARCH_MY_FILE":
            return Object.assign({}, state, {
                selected: [],
                selectProps: {
                    isMultiple: false,
                    withFolder: false,
                    withFile: false,
                    withSourceEnabled: false,
                },
                search: {
                    keywords: action.keywords,
                    searchPath: action.path,
                },
            });
        case "SHOW_IMG_PREIVEW":
            return Object.assign({}, state, {
                imgPreview: {
                    first: action.first,
                    other: state.fileList,
                },
            });
        case "SHOW_AUDIO_PREVIEW":
            return Object.assign({}, state, {
                audioPreview: {
                    ...state.audioPreview,
                    first: action.first,
                    other: state.fileList,
                },
            });
        case "AUDIO_PREVIEW_SET_IS_OPEN":
            return Object.assign({}, state, {
                audioPreview: {
                    ...state.audioPreview,
                    isOpen: action.isOpen,
                },
            });
        case "AUDIO_PREVIEW_SET_PLAYING":
            return Object.assign({}, state, {
                audioPreview: {
                    ...state.audioPreview,
                    playingName: action.playingName,
                    paused: action.paused,
                },
            });
        case "SAVE_FILE":
            return {
                ...state,
                fileSave: !state.fileSave,
            };
        case "SET_LAST_SELECT":
            const { file, index } = action;
            return {
                ...state,
                lastSelect: {
                    file,
                    index,
                },
            };
        case "SET_SHIFT_SELECTED_IDS":
            const { shiftSelectedIds } = action;
            return {
                ...state,
                shiftSelectedIds,
            };
        case "SET_NAVIGATOR":
            return {
                ...state,
                selected: [],
                selectProps: {
                    isMultiple: false,
                    withFolder: false,
                    withFile: false,
                    withSourceEnabled: false,
                },
                search: undefined,
            };
        case "SET_SIDE_BAR":
            return {
                ...state,
                sideBarOpen: action.open,
            };
        case "SET_CURRENT_POLICY":
            return {
                ...state,
                currentPolicy: action.policy,
            };
        case "CONFIRM_PURCHASE":
            return {
                ...state,
                purchase: action.purchase,
            };
        default:
            return state;
    }
};

export default explorer;
