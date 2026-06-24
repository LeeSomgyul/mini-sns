import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostUpdateParams, PostUpdateRequest } from "../types/postTypes";
import { postApi } from "../api/postApi";
import { FEED_KEYS, POST_KEYS } from "../../../constants/queryKey";
import toast from "react-hot-toast";

interface useUpdatePostProps {
    closeModal: () => void;
}

export const useUpdatePostMutation = ({closeModal}: useUpdatePostProps) => {

    // 기존 프론트로 가져온 content 및 tag 데이터
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({postId, data}: PostUpdateParams) => {
            const requestBody: PostUpdateRequest = {
                content: data.content,
                tagUsers: data.tagUsers.map(user => ({userId: user.userId}))
            };
            return postApi.updatePost(postId,requestBody);
        },
        //variables: 백엔드에 api 요청했을 때 사용했던 값(PostUpdateParams)
        onSuccess: (_, variables) => {
            const {postId} = variables;
            
            // 1. 수정 성공 시 'feeds' 쿼리 캐시 데이터 무효화 및 새로운 데이터로 업데이트
            queryClient.invalidateQueries({queryKey: FEED_KEYS.all});

            // 2. 수정 성공 시 'posts' 쿼리 캐시 데이터 무효화 및 새로운 데이터로 업데이트
            queryClient.invalidateQueries({queryKey: POST_KEYS.detail(postId)});

            closeModal();
            toast.success('게시물 수정을 완료하였습니다.');
        },
        onError: (error) => {
            console.log('게시물 수정 실패: ', error);
            toast.error('게시물 수정 중 오류가 발생했습니다.');
        }
    });
    
};