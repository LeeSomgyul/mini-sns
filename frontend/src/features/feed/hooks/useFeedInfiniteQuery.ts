import { useInfiniteQuery } from "@tanstack/react-query";
import type { FeedResponse } from "../types/feedResponseType";
import { feedApi } from "../api/feedApi";

//[무한스크롤]
//🚨Error 반환은 구체적으로 수정하기🚨
export const useFeedInfiniteQuery = (size: number = 5) => {
    return useInfiniteQuery<FeedResponse, Error>({
        // 1.key 단위로 데이터 캐싱
        queryKey: ["feeds", size],

        // 2.api 호출하여 데이터 가져오기
        queryFn: async({pageParam = null, signal}) => {
            return feedApi.getFeeds({
                cursorId: pageParam as number | null,
                size: size,
                signal: signal,
            });
        },

        // 3.무한스크롤 시작점 지정 (처음에는 모르기 때문에 null 전송)
        initialPageParam: null,

        // 4.다음 페이지가 있다면 어딘지 확인
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
        },

        // 5.성능 최적화 (3분 동안은 최신 데이터라고 인식)
        staleTime: 1000 * 60 * 3,
    });
};