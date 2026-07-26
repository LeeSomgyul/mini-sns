import api from "../../../common/api/axios";
import type { ApiResponse } from "../../../common/types/commonType";

export const withdrawApi = {
    // [회원 탈퇴]
    userWithdraw: async(): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(
            '/api/v1/auth/me'
        );

        return response.data;
    },
}