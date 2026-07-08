import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type { PostCommentCreateRequest, PostCommentResponse } from '../types/PostCommentType';

export const postCommentApi = {
    // 1. 특정 게시물에 댓글 작성
    // - 백엔드에서 응답: number commentId
    createComment: async(postId: number, request: PostCommentCreateRequest): Promise<number> => {
        const response = await api.post<ApiResponse<number>>(
            `/api/v1/posts/${postId}/comments`,
            request
        );

        return response.data.data;
    },

    // 2. 특정 게시물의 댓글 목록 조회
    // @param postId: 댓글이 소속되어 있는 게시물 id
    // @param cursor: 몇번째 댓글까지 확인했는지 (마지막으로 응답한 댓글 id)
    // @param size: 한번에 응답 할 댓글 개수
    getPostComments: async(postId: number, cursor: number | null, size: number = 10): Promise<PostCommentResponse> => {
        const response = await api.get<ApiResponse<PostCommentResponse>>(
            `/api/v1/posts/${postId}/comments`,
            {
                params: {
                    cursor,
                    size
                }
            }
        );

        return response.data.data;
    }
};