import api from "../../../common/api/axios";
import type { ApiResponse } from "../../../common/types/commonType";
import type { KakaoLoginRequest } from "../types/kakaoLoginType";
import type { LoginRequest, LoginResponse } from "../types/loginType";

export const loginApi = {
    //일반 로그인
    login: async(request: LoginRequest) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            '/api/v1/auth/login',
            request
        );
        return response.data.data;
    },
    //카카오 로그인
    kakaoLogin: async(request: KakaoLoginRequest) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            '/api/v1/auth/kakao',
            request
        );
        return response.data.data;
    }
}