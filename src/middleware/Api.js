import axios from "axios";
import Auth from "./Auth"

export const baseURL = "/api/v3";

const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    crossDomain: true,
});

instance.interceptors.response.use(
    function(response) {
        response.rawData = response.data;
        response.data = response.data.data;
        if (response.rawData.code != 0){
            // 登录过期
            if (response.rawData.code == 401){
                Auth.signout();
                window.location.href="#/Login"
            }
            throw new Error(response.rawData.msg);
        }
        return response;
    },
    function(error) {
        return Promise.reject(error);
    }
);

export default instance;
