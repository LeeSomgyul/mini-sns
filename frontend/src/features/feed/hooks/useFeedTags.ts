import { useQuery } from "@tanstack/react-query";
import { POST_KEYS, USER_KEYS } from "../../../constants/queryKey";
import { feedApi } from "../api/feedApi";
import { useMemo } from "react";
import type { UserTagResponse } from "../types/feedTagsType";

export const useFeedTags = (postId: number, isOpen: boolean) => {
    // 1. post 모듈에서 태그 목록 및 순서 가져오기 (모달이 열릴 때만 동작)
    const { data: postTagsData, isLoading: isPostTagsLoading } = useQuery({
        queryKey: POST_KEYS.tags(postId),
        queryFn: () => feedApi.getFeedPostTags(postId),
        enabled: isOpen,
    });

    // 2. post 모듈에서 받은 데이터에서 userId 배열 추출
    const userIds = useMemo(() => postTagsData?.map(tag => tag.taggedUserId) || [], [postTagsData]);

    // 3. user 모듈에서 사용자 정보 가져오기
    const { data: userTagsData, isLoading: isUserTagsLoading } = useQuery({
        queryKey: USER_KEYS.tags(userIds),
        queryFn: () => feedApi.getFeedUserTags(userIds),
        enabled: isOpen && userIds.length > 0,
    });

    // 4. 화면용 데이터 최종 조립 (프로필 이미지, 이름, 닉네임)
    const taggedUsers: UserTagResponse[] = useMemo(() => {
        if(!postTagsData || !userTagsData) return [];

        return postTagsData.map(tag => {
            const profile = userTagsData.find(p => p.userId === tag.taggedUserId);

            return{
                userId: tag.taggedUserId,
                tagOrder: tag.tagOrder,
                nickname: profile?.nickname || '알 수 없는 사용자',
                name: profile?.name || '',
                profileImageUrl: profile?.profileImageUrl || null
            };
        });
    }, [postTagsData, userTagsData]);

    return {
        taggedUsers,
        isLoading: isPostTagsLoading || isUserTagsLoading,
    }
};