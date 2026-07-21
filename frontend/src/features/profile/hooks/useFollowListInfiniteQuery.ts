import { useInfiniteQuery } from "@tanstack/react-query"
import { FOLLOW_KEYS } from "../../../constants/queryKey";
import { followApi } from "../api/followApi";
import type { FollowUserRequest, FollowUserResponse } from "../types/FollowType";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "../../../common/types/commonType";

interface FollowListInfiniteQueryProps{
    type: 'followings' | 'followers';
    userId: number;
    size?: number;
}

export const useFollowListInfiniteQuery = ({type, userId, size = 20}: FollowListInfiniteQueryProps) => {

    return useInfiniteQuery<FollowUserResponse, AxiosError<ErrorResponse>>({
        // 1. 캐시 데이터 저장 공간 정하기
        queryKey: type === 'followings'
            ? FOLLOW_KEYS.followings(userId)
            : FOLLOW_KEYS.followers(userId),

        // 2. api 호출하여 데이터 가져오기
        // pageParam: initialPageParam 및 getNextPageParam로 자동 주입
        queryFn: async ({pageParam}) => {
            const requestParams: FollowUserRequest = {
                userId: userId,
                cursor: pageParam as number | null,
                size: size
            };

            return type === 'followings'
                ? followApi.getFollowings(requestParams)
                : followApi.getFollowers(requestParams);
        },

        // 3. 무한스크롤 시작점 지정 (최신순으로 갱신되기 때문에 null로 지정)
        initialPageParam: null,

        // 4. 다음 페이지가 존재한다면 nextCursor에 값 주입
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
        },

        staleTime: 1000 * 60 * 3,
    });
}