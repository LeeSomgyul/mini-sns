import { useInfiniteQuery } from "@tanstack/react-query";
import { userSearchApi } from "../api/userSearchApi";
import { USER_KEYS } from "../../../constants/queryKey";


// [사용자 검색 인피니트 쿼리 커스텀 훅]
// - keyword: 사용자 검색 인풋
// - type: 전체 검색(홈), 친구 검색(태그)
export const useUserSearchQuery = (keyword: string, type: 'all' | 'friends' = 'all') => {
    const trimmedKeyword = keyword.trim();

    // Query: 데이터를 가져와서 보여주는 GET요청에 사용 
    return useInfiniteQuery({
        // 1. 검색어가 바뀔 때마다 각각 다른 캐시방 만들기 
        // - type이 'all'이면 ['users', 'search', 'all', keyword]
        // - type이 'friends'이면 ['users', 'search', 'friends', keyword]
        queryKey: USER_KEYS.search(trimmedKeyword, type),
        
        // 2. 검색어 찾아오는 함수 실행 
        queryFn: ({ pageParam, signal }) => 
            userSearchApi.searchUsers({ 
                keyword: trimmedKeyword,
                pageParam: pageParam as number,
                signal
            }),
        
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
        enabled: !!trimmedKeyword,
        
        // 1분 동안 캐시 유지
        staleTime: 1000 * 60 * 1,
    });
};