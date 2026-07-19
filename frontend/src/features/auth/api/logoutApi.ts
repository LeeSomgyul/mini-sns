import api from "../../../common/api/axios"
import type { ApiResponse } from "../../../common/types/commonType"

export const logoutApi = {
    // [로그아웃]
    logout: async (): Promise<void> => {
        const response = await api.post<ApiResponse<void>>(
            '/api/v1/auth/logout'
        );

        return response.data.data;
    },
}