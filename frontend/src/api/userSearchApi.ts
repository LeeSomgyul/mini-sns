import { useInfiniteQuery } from "@tanstack/react-query"
import type {UserSearchResponse, UserInfo, ApiResponse} from "../types/userSearchType";
import axios from "axios";


//[사용자 검색 api 연결]
//keyword: 사용자의 이름 또는 닉네임 검색
export const userSearchApi = (keyword: string) => {
    return useInfiniteQuery({
        //queryKey: keyword를 캐시라는 창고에 저장한 뒤, 찾을 때 users, search라는 이름표로 찾을 수 있다.
        queryKey: ['users', 'search', keyword],
        
        //queryFn: 데이터를 가져올 때 이 함수 실행
        queryFn: async ({pageParam, signal}): Promise<UserSearchResponse<UserInfo>> => {
            const response = await axios.get<ApiResponse<UserSearchResponse<UserInfo>>>(
                '/api/v1/users/search',
                {
                    params:{
                        keyword: keyword,
                        page: pageParam,
                        size: 20
                    },
                    signal
                }
            );
            return response.data.data;
        },

        //처음 페이지
        initialPageParam: 0,

        //다음 페이지 여부 확인 후 불러오기
        getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,

        //검색어(keyword)가 있다면 실행
        enabled: !!keyword.trim(),

        //60초 동안은 새로운 데이터라고 인식 (다른데 갔다가 와도 1분 안지났으면 저장된 데이터 그대로 보여줌)
        staleTime: 1000 * 60 * 1,
    });
};