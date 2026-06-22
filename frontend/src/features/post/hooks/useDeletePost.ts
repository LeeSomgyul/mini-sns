import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../api/postApi";
import toast from 'react-hot-toast';
import type { PostDto } from "../../feed/types/feedResponseType";

export interface FeedResponse {
    posts: PostDto[];
    nextCursor: number | null;
    hasNextPage: boolean;
}

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: number) => postApi.deletePost(postId),
        
        // postId: 제거 대상 id
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feeds'] });
            toast.success("게시물이 성공적으로 삭제되었습니다.");
        },
        onError: (error) => {
            console.error('게시물 삭제 실패: ', error);
            queryClient.invalidateQueries({queryKey: ['feeds']});
        }
    });
};