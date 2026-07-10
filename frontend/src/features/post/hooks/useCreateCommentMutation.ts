import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCommentStore } from "../../../common/store/useCommentStore";
import type { PostCommentRequest } from "../types/PostCommentType";
import { postCommentApi } from "../api/postCommentApi";
import { FEED_KEYS, POST_KEYS } from "../../../constants/queryKey";

interface CreateCommentProps{
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useCreateCommentMutation = ({onSuccess, onError}: CreateCommentProps) => {
    const queryClient = useQueryClient();

    const activePostId = useCommentStore((state) => state.activePostId);

    return useMutation({
        // 1. 댓글 추가 api 요청
        mutationFn: (request: PostCommentRequest) => {
            if(!activePostId){
                return Promise.reject(new Error("활성화된 게시물 id가 없습니다."));
            }

            return postCommentApi.createComment(activePostId, request);
        }, 

        // 2. 댓글 추가 성공 시 실행되는 로직
        onSuccess: () => {
            if(activePostId){
                // 댓글 목록 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: POST_KEYS.comments(activePostId)
                });

                // 게시물의 댓글 총 개수 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: POST_KEYS.detail(activePostId)
                });

                // 피드 화면에서 댓글 총 개수 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: FEED_KEYS.detail(activePostId)
                });

                // 피드 전체 목록 무한스크롤 댓글 수 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: FEED_KEYS.lists()
                });
            }
            
            if(onSuccess) onSuccess();
        },

        // 3. 댓글 추가 실패 시 실행되는 로직
        onError: (error: any) => {
            if(onError) onError(error);
        },
    });
};