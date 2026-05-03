import api from "../../../api/axios";
import type { ApiResponse } from "../../../common/types/commonType";
import type { LoginRequest, LoginResponse } from "../types/loginType";

export const loginApi = {
    //로그인
    login: async(request: LoginRequest) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            '/api/v1/auth/login',
            request
        );
        return response.data.data;
    }
}