import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type { PostCommentCreateRequest } from '../types/PostCommentType';

export const postCommentApi = {
    //1. 특정 게시물에 댓글 작성
    // - 백엔드에서 응답: number commentId
    createComment: async(postId: number, request: PostCommentCreateRequest): Promise<number> => {
        const response = await api.post<ApiResponse<number>>(
            `/api/v1/posts/${postId}/comments`,
            request
        );

        return response.data.data;
    },
};