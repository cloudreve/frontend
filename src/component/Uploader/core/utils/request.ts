import axios, { AxiosRequestConfig } from "axios";
import { Response } from "../types";
import {
    HTTPError,
    RequestCanceledError,
    TransformResponseError,
} from "../errors";

export const { CancelToken } = axios;
export { CancelTokenSource } from "axios";

const baseConfig = {
    transformResponse: [
        (response: any) => {
            try {
                return JSON.parse(response);
            } catch (e) {
                throw new TransformResponseError(response, e);
            }
        },
    ],
};

const cdBackendConfig = {
    ...baseConfig,
    baseURL: "/api/v3",
    withCredentials: true,
};

export function request<T = any>(url: string, config?: AxiosRequestConfig) {
    return axios.request<T>({ ...baseConfig, ...config, url }).catch((err) => {
        if (axios.isCancel(err)) {
            throw new RequestCanceledError();
        }

        if (err instanceof TransformResponseError) {
            throw err;
        }

        throw new HTTPError(err, url);
    });
}

export function requestAPI<T = any>(url: string, config?: AxiosRequestConfig) {
    return request<Response<T>>(url, { ...cdBackendConfig, ...config });
}
