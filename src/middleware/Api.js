import axios from "axios";
import Auth from "./Auth";

export let baseURL = "/api/v3";

export const getBaseURL = () => {
    return baseURL;
};

const instance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    crossDomain: true
});

function AppError(message,code) {
    this.code = code;
    this.message = message || '未知错误';
    this.stack = (new Error()).stack;
}
AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;

instance.interceptors.response.use(
    function(response) {
        response.rawData = response.data;
        response.data = response.data.data;
        if (
            response.rawData.code !== undefined &&
            response.rawData.code !== 0 &&
            response.rawData.code !== 203
        ) {
            // 登录过期
            if (response.rawData.code === 401) {
                Auth.signout();
                window.location.href = "#/Login";
            }
            throw new AppError(response.rawData.msg,response.rawData.code);
        }
        return response;
    },
    function(error) {
        return Promise.reject(error);
    }
);

export default instance;
