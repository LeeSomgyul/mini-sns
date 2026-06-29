import axios from "axios";
import {useAuthStore} from "../../features/auth/store/authStore";
import { ROUTES } from "../../constants/routes";

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

//[응답(response) 인터셉터]
// 이미 앱이 잘 켜져서 돌아가는 도중에 가만히 있다가 토큰이 만료되는 돌발 상황이 오면, 실시간으로 에러를 가로채서 수습해 주는 역할.
api.interceptors.response.use(
    // 200번대 정상 응답은 그대로 통과
    (response) => response,
    // 400~500번대 에러가 뜨면 아래 코드 실행 (토큰 재발급)
    async(error) => {
        // 1. 백엔드로 응답 보내다가 막힌 API 잠시 보관 (토큰 발급 후 다시 요청해야 하니까)
        const originalRequest = error.config;

        // 2-1. 에러 방어: 이미지 가공 요청(/insecure) 
        const isImgproxyRequest = originalRequest?.url && originalRequest.url.includes('/insecure');

        // 2-2. 에러 방어: 로그인 시도이거나 재발급 요청 자체인 경우는 인터셉터 실행X
        const isAuthRequest = originalRequest?.url 
            && (originalRequest.url.includes('/login') || originalRequest.url.includes('/reissue'))

        if(isImgproxyRequest || isAuthRequest){
            return Promise.reject(error);
        }

        // 3. 401, 403 토큰 만료 에러일 시 실행
        if((error.response?.status === 401 || error.response?.status === 403) && originalRequest && !originalRequest._retry){
            originalRequest._retry = true;

            try{
                // 3-1. 순수 axios 사용하여 토큰 재발급 api 요청
                // - 기존 api.post 요청을 사용하면 만료된 accessToken이 헤더에 전달됨
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/reissue`,
                    {},
                    {withCredentials: true}
                );

                // 3-2. 백엔드의 새로운 accessToken 응답 추출
                // - <ApiResponse<LoginResponse>> 구조로 response.data.data.accessToken 깊이
                const newAccessToken = response.data.data.accessToken;

                // 3-3. Zustand에 새로운 accessToken으로 업데이트
                useAuthStore.getState().setAccessToken(newAccessToken);

                // 3-4. 아까 실패했던 요청에 새로운 토큰 넣어서 재전송
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            }catch(error){
                // 만약 RefreshToken도 만료되었거나 서버 에러난 경우는 '강제 로그아웃'
                useAuthStore.getState().logout();
                
                if(window.location.pathname !== ROUTES.LOGIN){
                    window.location.href = ROUTES.LOGIN;
                }

                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;