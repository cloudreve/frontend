import { ThunkAction } from "redux-thunk";
import { setOptionModal } from "../viewUpdate/action";

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
                        reject("用户拒绝");
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
