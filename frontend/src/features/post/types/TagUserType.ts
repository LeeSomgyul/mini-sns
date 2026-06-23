//PostTag.tsx 에서 태그된 사용자 1명당 갖고 있는 정보
export interface TagUserType{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl?: string | null;
}

// 게시물 수정 시 userId로 nickname 찾아오기
export interface TagUserNickname{
    userId: number;
    nickname: string;
}