import { useInfiniteQuery } from "@tanstack/react-query";
import type { TagUserSearchRequest, TagUserSearchResponse } from "../types/TagUserSearchType";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "../../../common/types/commonType";
import { USER_KEYS } from "../../../constants/queryKey";
import { userSearchApi } from "../api/userSearchApi";

interface TagUserSearchInfiniteQueryProps{
    keyword: string;
    size: number;
    enabled: boolean;
}

export const useTagUserSearchInfiniteQuery = ({keyword, size, enabled}: TagUserSearchInfiniteQueryProps) => {

    return useInfiniteQuery<TagUserSearchResponse, AxiosError<ErrorResponse>>({
        // 1. 캐시 데이터 저장공간 정하기
        queryKey: USER_KEYS.searchFollowings(keyword),

        // 2. api 호출하여 데이터 가져오기
        // pageParam: initialPageParam 및 getNextPageParam로 자동 주입
        queryFn: async({pageParam}) => {
            const requestParams: TagUserSearchRequest = {
                keyword: keyword,
                searchAfter: pageParam as (string | number)[] | null,
                size: size
            };

            return userSearchApi.searchTagUsers(requestParams);
        },

        // 3. 무한스크롤 시작점 지정 
        initialPageParam: null,

        // 4. 다음 페이지 존재한다면 가져오기 
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextSearchAfter : undefined;
        },

        // 5. 조건부 실행 (검색 모달창이 열려있고, keyword가 있을 때만 실행)
        enabled: enabled,

        staleTime: 1000 * 60 * 30
    })
};