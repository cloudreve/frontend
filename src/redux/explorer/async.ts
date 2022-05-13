import { ThunkAction } from "redux-thunk";
import { setOptionModal } from "../viewUpdate/action";
import i18next from "../../i18n";

export const askForOption = (
    options: any,
    title: string
): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<any> => {
        return new Promise<void>((resolve, reject) => {
            const dialog = {
                open: true,
                title: title,
                options: options,
            };
            dispatch(
                setOptionModal({
                    ...dialog,
                    onClose: () => {
                        dispatch(setOptionModal({ ...dialog, open: false }));
                        reject(i18next.t("fileManager.userDenied"));
                    },
                    callback: (option: any) => {
                        resolve(option);
                        dispatch(setOptionModal({ ...dialog, open: false }));
                    },
                })
            );
        });
    };
};
