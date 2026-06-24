import { useQuery } from "@tanstack/react-query";
import { postApi } from "../api/postApi";

// 게시물 수정 시 태그 userId로 사용자 정보 찾아오기
export const useTagUserProfile = (userIds: number[], enabled: boolean) => {
    return useQuery({
        queryKey: ['post', 'tagUserId', userIds],
        queryFn: () => postApi.getTagUserProfile(userIds),
        enabled: enabled && userIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });
};