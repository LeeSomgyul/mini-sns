import { useInfiniteQuery } from "@tanstack/react-query";
import { userSearchApi } from "../api/userSearchApi";

// 키 이름표 만드는 메서드 
export const userKeys = {
    // 모든 캐시 방 이름의 첫 시작 이름
    all: ['users'] as const,
    // 각자 키 제작 
    search: (keyword: string) => [...userKeys.all, 'search', keyword] as const,
};

// [사용자 검색 인피니트 쿼리 커스텀 훅]
export const useUserSearchQuery = (keyword: string) => {

    // Query: 데이터를 가져와서 보여주는 GET요청에 사용 
    return useInfiniteQuery({
        // 검색어가 바뀔 때마다 각각 다른 캐시방 만들기 
        queryKey: userKeys.search(keyword),
        
        // 검색어 찾아오는 함수 실행 
        queryFn: ({ pageParam, signal }) => 
            userSearchApi.searchUsers({ keyword, pageParam: pageParam as number, signal }),
        
        // 시작 페이지는 0
        initialPageParam: 0,
        
        // 다음 페이지 번호 계산 
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.last) {
                return undefined;
            }
            return lastPage.page + 1;
        },
        
        // 검색어가 공백이 아닐 때만 API 요청
        enabled: !!keyword.trim(),
        
        // 1분 동안 캐시 유지
        staleTime: 1000 * 60 * 1,
    });
};