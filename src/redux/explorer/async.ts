import { ThunkAction } from "redux-thunk";
import Auth from "../../middleware/Auth";
import pathHelper from "../../utils/page";
import { closeAllModals, confirmPurchase, toggleSnackbar } from "./index";
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

const purchased = new Map<string, boolean>();

export const trySharePurchase = (
    share: any
): ThunkAction<any, any, any, any> => {
    return async (dispatch, getState): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            const {
                router: {
                    location: { pathname },
                },
            } = getState();
            if (pathHelper.isSharePage(pathname) && share && share.score > 0) {
                if (!Auth.Check()) {
                    dispatch(
                        toggleSnackbar(
                            "top",
                            "right",
                            i18next.t("share.pleaseLogin"),
                            "warning"
                        )
                    );
                    dispatch(closeAllModals());
                    reject(i18next.t("fileManager.userDenied"));
                    return;
                }

                if (
                    !Auth.GetUser().group.shareFree &&
                    !purchased.has(share.key)
                ) {
                    dispatch(
                        confirmPurchase({
                            score: share.score,
                            onClose: () => {
                                dispatch(confirmPurchase(undefined));
                                reject(i18next.t("fileManager.userDenied"));
                            },
                            callback: () => {
                                purchased.set(share.key, true);
                                resolve();
                                dispatch(confirmPurchase(undefined));
                            },
                        })
                    );
                    return;
                }
            }

            resolve();
        });
    };
};
