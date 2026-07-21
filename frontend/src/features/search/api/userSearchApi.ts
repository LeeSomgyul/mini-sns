import api from "../../../common/api/axios";
import type { ApiResponse } from "../../../common/types/commonType";
import type { TagUserSearchRequest, TagUserSearchResponse } from "../types/TagUserSearchType";
import type { UserSearchResponse, UserInfo } from "../types/userSearchType";

// GET 실행 시 넘겨줄 데이터
interface FetchUserSearchParams {
    keyword: string;//사용자의 입력 값
    pageParam: number;//현재 몇 페이지를 보고 있는지 (무한 스크롤)
    signal?: AbortSignal;//마지막 요청만 처리
}

export const userSearchApi = {
    // [사용자 전체 검색]
    searchUsers: async ({ keyword, pageParam, signal }: FetchUserSearchParams): Promise<UserSearchResponse<UserInfo>> => {
        const response = await api.get<ApiResponse<UserSearchResponse<UserInfo>>>(
            '/api/v1/search/users',
            {
                params: {
                    keyword: keyword,
                    page: pageParam,
                    size: 20
                },
                signal, 
            }
        );
        
        // 서버가 정상적으로 응답했을때, 아닐때 응답 
        return response.data.data || {
            content: [],
            last: true,
            page: 0
        };
    },

    // [팔로잉한 사용자 검색]
    searchTagUsers: async ({keyword, searchAfter, size=10}: TagUserSearchRequest): Promise<TagUserSearchResponse> => {
        const params = {
            keyword: keyword,
            searchAfter: searchAfter && searchAfter.length > 0
                ? searchAfter.join(',')
                : undefined,
            size: size
        };
        
        const response = await api.get<ApiResponse<TagUserSearchResponse>>(
            '/api/v1/search/tagUsers',
            {params}
        );

        // 서버가 정상적으로 응답했을때, 아닐때 응답 
        return response.data.data || {
            content: [],
            hasNextPage: false,
            nextSearchAfter: null,
        };
    },
};