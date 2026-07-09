import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useCommentStore } from "../../../common/store/useCommentStore";
import { postCommentApi } from "../api/postCommentApi";
import { FEED_KEYS, POST_KEYS } from "../../../constants/queryKey";
import type { PostCommentResponse } from "../types/PostCommentType";

interface DeleteCommentProps{
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useDeleteCommentMutation = ({onSuccess, onError}: DeleteCommentProps) => {
    const queryClient = useQueryClient();
    const activePostId = useCommentStore((state) => state.activePostId);

    return useMutation({
        // 1. api 요청 전 댓글 리스트 낙관적 업데이트
        onMutate: async(commentId: number) => {
            if(!activePostId) return;

            // 댓글 목록 데이터가 저장되어 있는 쿼리 키 
            const prefixQueryKey = POST_KEYS.comments(activePostId);

            // 댓글 목록을 불러오는 중이라면 낙관적 업데이트 멈춤 (데이터 꼬임 방지)
            await queryClient.cancelQueries({queryKey: prefixQueryKey});

            // 댓글 데이터 백업
            const previousComments = queryClient.getQueriesData({queryKey: prefixQueryKey});

            // 낙관적 업데이트를 위한 캐시 데이터 강제 조정
            queryClient.setQueriesData<InfiniteData<PostCommentResponse>>({queryKey: prefixQueryKey}, (oldData) => {
                if(!oldData) return oldData;

                return{
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        content: page.content.filter((c) => Number(c.commentId) !== Number(commentId))
                    }))
                }
            });

            return {previousComments};
        },

        // 2. 백엔드로 댓글 delete 요청
        mutationFn: (commentId: number) => {
            if(!activePostId){
                return Promise.reject(new Error("활성화된 게시물 id가 없습니다."));
            }

            return postCommentApi.deletePostComment(commentId);
        },

        // 3. 성공이든 실패든 api 요청 끝난 이후
        onSuccess: async() => {
            if(!activePostId) return;

            return await Promise.all([
                // 기존 댓글 목록 업데이트
                queryClient.invalidateQueries({
                    queryKey: POST_KEYS.comments(activePostId)
                }),

                // 게시물의 댓글 총 개수 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: POST_KEYS.detail(activePostId)
                }),

                // 피드 화면에서 댓글 총 개수 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: FEED_KEYS.detail(activePostId)
                }),

                // 피드 전체 목록 무한스크롤 댓글 수 캐시 업데이트
                queryClient.invalidateQueries({
                    queryKey: FEED_KEYS.lists()
                }),
            ]);
        },

        // 4. 삭제 실패 시 실행 로직
        onError: (error: any, context: any) => {
            if(!activePostId) return;

            if(context?.previousComments){
                queryClient.setQueryData(POST_KEYS.comments(activePostId), context.previousComments);
            }
            if(onError) onError(error);
        },

        onSettled: () => {
            if(onSuccess) onSuccess();
        }
        
    });
};