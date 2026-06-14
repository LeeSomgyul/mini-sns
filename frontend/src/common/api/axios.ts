import axios from "axios";
import {useAuthStore} from "../../features/auth/store/authStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,//RefreshToken를 쿠키를 서버로 자동 보내는것 허용
});

//[요청(request) 인터셉터]: 백엔드로 전달 전에 accessToken 검사
api.interceptors.request.use((config) => {
        const token = useAuthStore.getState().accessToken;

        // [이미지 처리 관련 Nginx & imgproxy]
        // 주소에 'insecure'가 포함되어 있다면 Authorization 헤더에 토큰 보내지 않는다.
        const isImgproxyRequest = config.url && config.url.includes('/insecure');

        if(token && config.headers && !isImgproxyRequest){
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }
);

export default api;