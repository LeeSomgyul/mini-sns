export interface TagUserSearchRequest{
    keyword?: string;
    searchAfter?: (string|number)[] | null;
    size?: number;
};

export interface TagUserSearchResponse{
    content: UserSearchDto[];
    hasNextPage: boolean;
    nextSearchAfter: (string|number)[] | null;
};

export interface UserSearchDto{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl: string;
};

