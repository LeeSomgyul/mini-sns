import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostUpdateParams, PostUpdateRequest } from "../types/postTypes";
import { postApi } from "../api/postApi";

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
        onSuccess: () => {

        },
        onError: () => {

        }
    });
    
};