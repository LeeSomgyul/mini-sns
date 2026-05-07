//PostTag.tsx 에서 태그된 사용자 1명당 갖고 있는 정보
export interface TagUserType{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl?: string;
}