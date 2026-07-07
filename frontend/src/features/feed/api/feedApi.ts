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
    getFeedComments: async(postId: number, page: number): Promise<FeedCommentResponse> => {

        // [임시] 백엔드 연동이 안되어있어서 0.8초 지연 후 가짜 응답 주기(🚨api 개발 후 수정하기🚨)
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 가짜 백엔드 응답 데이터 구조
        const response = {
            status: 'success',
            message: '댓글 목록 조회 성공',
            data: { 
                content: [
                    {
                        commentId: 201,
                        author: {
                            userId: 12,
                            nickname: '코딩열공',
                            profileImageUrl: `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`
                        },
                        content: `[${postId}번 게시물] 피드 댓글창 인터페이스 연동중...`,
                        createdAt: '2026-07-07T17:50:00Z',
                        isMine: true
                    },
                    {
                        commentId: 202,
                        author: {
                            userId: 45,
                            nickname: '리액트깎는노인',
                            profileImageUrl: null
                        },
                        content: '타입 스펙이 아주 간결하고 이쁘게 뽑혔네요.',
                        createdAt: '2026-07-07T17:52:00Z',
                        isMine: false
                    }
                ],
                nextCursor: page + 1, // 다음 요청할 페이지 번호 연산
                hasNextPage: page < 2 // 2페이지 미만일 때만 다음 페이지가 있다고 가정 (테스트용)
            }
        };

        return response.data;
    }
};