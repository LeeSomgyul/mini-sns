//search-02 사용자 검색에서 사용
export interface UserSearchResponse<T>{
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

//content[] 안에 내용
export interface UserInfo{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl: string | null;
}

