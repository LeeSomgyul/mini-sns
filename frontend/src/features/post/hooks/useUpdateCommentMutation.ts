import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCommentStore } from "../../../common/store/useCommentStore";
import type { FeedComment, PostCommentResponse } from "../types/PostCommentType";
import { postCommentApi } from "../api/postCommentApi";
import { POST_KEYS } from "../../../constants/queryKey";
import type { ErrorResponse } from "../../../common/types/commonType";

interface UpdateCommentProps {
    onSuccess?: () => void;
    onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useUpdateCommentMutation = ({onSuccess, onError}: UpdateCommentProps) => {

    const queryClient = useQueryClient();
    const activePostId = useCommentStore((state) => state.activePostId);
    
    // FeedComment: 백엔드 응답 성공 시 주는 단건 댓글 데이터
    // AxiosError: 에러 타입
    // commentId, content: 훅 실행할 때 넘길 파라미터 타입
    return useMutation<FeedComment, AxiosError<ErrorResponse>, {commentId: number; content: string}>({
        // 1. 백엔드로 댓글 수정 api 요청
        mutationFn: ({commentId, content}) => {
            if(!activePostId) {
                return Promise.reject(new Error("활성화된 게시물 id가 없습니다."));
            }
            
            return postCommentApi.updatePostComment(commentId, {content});
        },

        // 2. 댓글 수정 성공 시 실행
        onSuccess: (updatedComment: FeedComment) => {
            if(!activePostId) return;

            // 댓글 데이터 저장된 쿼리 키 가져오기
            const prefixQueryKey = POST_KEYS.comments(activePostId);

            // 댓글 내용(FeedComment 데이터)만 수정
            queryClient.setQueriesData<InfiniteData<PostCommentResponse>>({queryKey: prefixQueryKey}, (oldData) => {
                if(!oldData) return oldData;

                return{
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        content: page.content.map((c: FeedComment) => 
                            Number(c.commentId) === Number(updatedComment.commentId) ? updatedComment : c
                        )
                    }))
                };
            })

            if(onSuccess) onSuccess();
        },

        // 3. 댓글 수정 실패 시 실행
        onError: (error) => {
            if(onError) onError(error);
        },
    });
};