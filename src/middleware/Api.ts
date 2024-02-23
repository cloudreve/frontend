import axios from "axios";
import Auth from "./Auth";
import i18next from "../i18n";

export const baseURL = "/api/v3";

export const getBaseURL = () => {
    return baseURL;
};

export const getPreviewURL = (
    isShare: boolean,
    shareID: any,
    fileID: any,
    path: any
): string => {
    return (
        getBaseURL() +
        (isShare
            ? "/share/preview/" +
              shareID +
              (path !== "" ? "?path=" + encodeURIComponent(path) : "")
            : "/file/preview/" + fileID)
    );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const instance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

export class AppError extends Error {
    constructor(message: string | undefined, public code: any, error: any) {
        super(message);
        this.code = code;
        if (i18next.exists(`errors.${code}`, { ns: "common" })) {
            this.message = i18next.t(`errors.${code}`, {
                ns: "common",
                message,
            });
        } else if (i18next.exists(`vasErrors.${code}`, { ns: "common" })) {
            this.message = i18next.t(`vasErrors.${code}`, {
                ns: "common",
                message,
            });
        } else if (i18next.exists(`errors.${code}`, { ns: "dashboard" })) {
            this.message = i18next.t(`errors.${code}`, {
                ns: "dashboard",
                message,
            });
        } else {
            this.message =
                message || i18next.t("unknownError", { ns: "common" });
        }

        this.message +=
            error && !this.message.includes(error) ? ` (${error})` : "";
        this.stack = new Error().stack;
    }
}

instance.interceptors.response.use(
    function (response: any) {
        response.rawData = response.data;
        response.data = response.data.data;
        if (
            response.rawData.code !== undefined &&
            response.rawData.code !== 0 &&
            response.rawData.code !== 203
        ) {
            // Login expired
            if (response.rawData.code === 401) {
                Auth.signout();
                window.location.href =
                    "/login?redirect=" +
                    encodeURIComponent(
                        window.location.pathname + window.location.search
                    );
            }

            // Non-admin
            if (response.rawData.code === 40008) {
                window.location.href = "/home";
            }

            // Not binding mobile phone
            if (response.rawData.code === 40010) {
                window.location.href = "/setting?modal=phone";
            }
            throw new AppError(
                response.rawData.msg,
                response.rawData.code,
                response.rawData.error
            );
        }
        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default instance;
