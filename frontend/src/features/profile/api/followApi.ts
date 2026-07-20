import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type {
    FollowRequest, FollowResponse,
    UnfollowRequest, UnfollowResponse,
    FollowUserResponse,
    FollowUserRequest
} from '../types/FollowType';

export const followApi = {
    // [팔로우 요청]
    follow: async (request: FollowRequest): Promise<FollowResponse> => {
        const response = await api.post<ApiResponse<FollowResponse>>(
            '/api/v1/follows/creat',
            request
        );

        return response.data.data;
    },

    // [언팔로우 요청]
    unfollow: async (request: UnfollowRequest): Promise<UnfollowResponse> => {
        const response = await api.post<ApiResponse<UnfollowResponse>>(
            '/api/v1/follows/destroy',
            request
        );

        return response.data.data;
    },

    // [팔로잉 목록 조회] ID 가 userId인 사용자의 팔로잉 목록 조회
    getFollowings: async ({userId, cursor, size = 20}: FollowUserRequest): Promise<FollowUserResponse> => {
        const response = await api.get<ApiResponse<FollowUserResponse>>(
            `/api/v1/users/${userId}/followings`,
            {params: {cursor, size}}
        );

        return response.data.data;
    },

    // [팔로우 목록 조회] ID 가 userId인 사용자의 팔로우 목록 조회
    getFollowers: async ({userId, cursor, size}: FollowUserRequest): Promise<FollowUserResponse> => {
        const response = await api.get<ApiResponse<FollowUserResponse>>(
            `/api/v1/users/${userId}/followers`,
            {params: {cursor, size}}
        );

        return response.data.data;
    },
}