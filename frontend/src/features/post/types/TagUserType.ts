//PostTag.tsx 에서 태그된 사용자 1명당 갖고 있는 정보
export interface TagUserType{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl?: string | null;
}

// 응답: 게시물 수정 시 userId로 받아온 정보
export interface TagUserProfileResponse{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl: string | null;
}