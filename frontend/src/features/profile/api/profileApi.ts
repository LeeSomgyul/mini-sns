import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type { PostUserProfileResponse } from '../types/PostUserProfileResponse'; 
import type { UserProfileResponse } from '../types/UserProfileResponse';

export const profileApi = {
    // 1. user 모듈에서 사용자 정보 가져오기
    getUserProfile: async (userId: number): Promise<UserProfileResponse> => {
        const response = await api.get<ApiResponse<UserProfileResponse>>(
            `/api/v1/users/${userId}/profile`
        );
        return response.data.data;
    },

    // 2. post 모듈에서 사용자 정보 가져오기
    getPostUserProfile: async (userId: number, page: number, size: number = 12): Promise<PostUserProfileResponse> => {
        const response = await api.get<ApiResponse<PostUserProfileResponse>>(
            `/api/v1/posts/users/${userId}/profile`,
            {
                params: {page, size}
            }
        );
        return response.data.data;
    },
};