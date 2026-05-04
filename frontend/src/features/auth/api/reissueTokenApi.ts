import api from "../../../api/axios";
import type { ApiResponse } from "../../../common/types/commonType";
import type { LoginResponse } from "../types/loginType";

export const reissueTokenApi = {
    //새로고침 시 토큰 재발급
    reissueToken: async () => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            '/api/v1/auth/reissue'
        );
        
        return response.data.data;
    }
}