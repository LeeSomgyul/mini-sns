import api from '../../../common/api/axios';
import type { ApiResponse } from '../../../common/types/commonType';
import type { FeedCommentResponse } from '../types/feedCommentType';
import type { FeedParams } from "../types/feedParamsType";
import type { FeedResponse, PostDto } from "../types/feedResponseType";
import type { PostTagResponse, UserTagResponse } from '../types/feedTagsType';

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

    // 3. post 모듈의 게시물 태그 정보
    getFeedPostTags: async(postId: number): Promise<PostTagResponse[]> => {
        const response = await api.get<ApiResponse<PostTagResponse[]>>(
            `/api/v1/posts/${postId}/tags`
        );
        return response.data.data;
    },

    // 4. user 모듈의 게시물 태그 정보
    getFeedUserTags: async(userIds: number[]): Promise<UserTagResponse[]> => {
        const response = await api.post<ApiResponse<UserTagResponse[]>>(
            `/api/v1/users/tags`,
            {userIds}
        );
        return response.data.data;
    },

    // 5. 댓글 가짜 데이터 반환 (🚨api 개발 후 수정하기🚨)
    getFeedComments: async(postId: number): Promise<FeedCommentResponse> => {
        
    }
};