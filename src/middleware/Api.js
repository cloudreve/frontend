import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://127.0.0.1:5000/Api/V3'
});

instance.interceptors.response.use(function (response) {
    response.data = response.data.data
    return response;
}, function (error) {
    return Promise.reject(error);
});

export default instance