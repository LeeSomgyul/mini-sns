import api from '../../../common/api/axios';
import type { ApiResponse } from '../../../common/types/commonType';
import type { FeedParams } from "../types/feedParamsType";
import type { FeedResponse, PostDto } from "../types/feedResponseType";

export const feedApi = {
    //1. 피드 조회
    getFeeds: async({cursorId, size = 5, signal}: FeedParams): Promise<FeedResponse> => {
        const response = await api.get<ApiResponse<FeedResponse>>(
            '/api/v1/feed',
            {
                params:{
                    cursorId,
                    size
                },
                signal
            }
        );

        return response.data.data || {posts: [], nextCursor: 0, hasNextPage: false};
    },

    // 2. 프로필 단건 게시물 상세 조회
    getFeedDetail: async (postId: number): Promise<PostDto> => {
        const response = await api.get<ApiResponse<PostDto>>(
            `/api/v1/feed/${postId}`
        );
        return response.data.data;
    },
};