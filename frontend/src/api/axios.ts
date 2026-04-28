import axios from "axios";
import {useAuthStore} from "../store/authStore";

const api = axios.create({
    baseURL: 'http://localhost:8080',//백엔드 8080과 통신
    withCredentials: true,//RefreshToken를 쿠키를 서버로 자동 보내는것 허용
});

//[요청(request) 인터셉터]: 백엔드로 전달 전에 accessToken 검사
api.interceptors.request.use((config) => {
        const token = useAuthStore.getState().accessToken;

        if(token && config.headers){
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }
);

export default api;