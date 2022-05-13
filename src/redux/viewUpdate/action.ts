import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import Auth from "../../middleware/Auth";
import { askForOption } from "../explorer/async";
import i18next, { languages } from "../../i18n";

export interface ActionSetSubtitle extends AnyAction {
    type: "SET_SUBTITLE";
    title: string;
}

export const setSubtitle = (title: string): ActionSetSubtitle => {
    return {
        type: "SET_SUBTITLE",
        title,
    };
};

export const closeContextMenu = () => {
    return {
        type: "CLOSE_CONTEXT_MENU",
    };
};

export const changeContextMenu = (type: string, open: boolean) => {
    return {
        type: "CHANGE_CONTEXT_MENU",
        menuType: type,
        open: open,
    };
};

export const changeSubTitle = (
    title: string
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState) => {
        const state = getState();
        document.title =
            title === null || title === undefined
                ? state.siteConfig.title
                : title + " - " + state.siteConfig.title;
        dispatch(setSubtitle(title));
    };
};

export const setOptionModal = (option: any) => {
    return {
        type: "SET_OPTION_MODAL",
        option: option,
    };
};

export const openFileSelector = () => {
    return {
        type: "OPEN_FILE_SELECTOR",
    };
};

export const openFolderSelector = () => {
    return {
        type: "OPEN_FOLDER_SELECTOR",
    };
};

export const setPagination = (pagination) => {
    return {
        type: "SET_PAGINATION",
        pagination: pagination,
    };
};

export const setShareInfo = (shareInfo) => {
    return {
        type: "SET_SHARE_INFO",
        shareInfo: shareInfo,
    };
};

export const changePageSize = (
    size: number
): ThunkAction<any, any, any, any> => {
    return (dispatch, getState) => {
        const {
            explorer: { dirList, fileList },
            viewUpdate: { pagination },
        } = getState();
        const total = dirList.length + fileList.length;
        let page = pagination.page;
        if (pagination.page * size > total) {
            page = Math.max(Math.ceil(total / size), 1);
        } else if (size === -1) {
            page = 1;
        }
        Auth.SetPreference("pagination", size);
        dispatch(
            setPagination({
                ...pagination,
                size: size,
                page: page,
            })
        );
    };
};

export const selectLanguage = (): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState) => {
        let option: any;
        let lng = "";
        try {
            const allOptions = languages.map((e) => {
                return {
                    key: e.code,
                    name: e.displayName,
                };
            });
            option = await dispatch(
                askForOption(allOptions, i18next.t("setting.language"))
            );
        } catch (e) {
            console.log(e);
            return;
        }

        lng = option.key;
        await i18next.changeLanguage(lng);
    };
};
