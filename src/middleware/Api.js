import axios from "axios";

const instance = axios.create({
    baseURL: "http://127.0.0.1:5000/api/v3",
    withCredentials: true,
    crossDomain: true,
});

instance.interceptors.response.use(
    function(response) {
        response.rawData = response.data;
        response.data = response.data.data;
        if (response.rawData.code != 0){
            throw new Error(response.rawData.msg);
        }
        return response;
    },
    function(error) {
        return Promise.reject(error);
    }
);

export default instance;
