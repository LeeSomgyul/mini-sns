import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type { ProfileNicknameCheck, UserPrivacyInfoResponse } from '../types/UserPrivacyInfoResponse';

export const userPrivacyInfoApi = {
    // 1. 사용자의 프로필 개인정보 가져오기
    getUserPrivacyInfo: async(): Promise<UserPrivacyInfoResponse> => {
        const response = await api.get<ApiResponse<UserPrivacyInfoResponse>>(
            '/api/v1/users/me'
        );

        return response.data.data;
    },

    // 2. 개인정보 변경 닉네임 중복체크
    checkNickName: async(nickname: string): Promise<ProfileNicknameCheck> => {
        const response = await api.get<ApiResponse<ProfileNicknameCheck>>(
            `/api/v1/users/me/nickname/exists`,
            {params: {nickname}}
        );

        return response.data.data;
    },
};