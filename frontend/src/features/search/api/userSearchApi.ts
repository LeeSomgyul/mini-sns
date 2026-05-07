import api from "../../../common/api/axios";
import type { ApiResponse } from "../../../common/types/commonType";
import type { UserSearchResponse, UserInfo } from "../types/userSearchType";

// GET 실행 시 넘겨줄 데이터
interface FetchUserSearchParams {
    keyword: string;//사용자의 입력 값
    pageParam: number;//현재 몇 페이지를 보고 있는지 (무한 스크롤)
    signal?: AbortSignal;//마지막 요청만 처리
}

export const userSearchApi = {
    //[사용자 전체 검색]
    searchUsers: async ({ keyword, pageParam, signal }: FetchUserSearchParams): Promise<UserSearchResponse<UserInfo>> => {
        const response = await api.get<ApiResponse<UserSearchResponse<UserInfo>>>(
            '/api/v1/users/search',
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
        return response.data.data || { content: [], last: true, page: 0 };
    }
};