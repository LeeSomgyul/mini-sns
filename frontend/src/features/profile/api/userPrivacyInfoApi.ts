import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type { UserPrivacyInfoResponse } from '../types/UserPrivacyInfoResponse';

export const userPrivacyInfoApi = {
    // 1. 사용자의 프로필 개인정보 가져오기
    getUserPrivacyInfo: async(): Promise<UserPrivacyInfoResponse> => {
        const response = await api.get<ApiResponse<UserPrivacyInfoResponse>>(
            '/api/v1/users/me'
        );

        return response.data.data;
    },
};