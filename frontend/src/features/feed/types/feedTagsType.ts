// post 모듈에서 전달받는 태그 정보
export interface PostTagResponse {
    taggedUserId: number;
    tagOrder: number;
}

// user 모듈에서 전달받는 태그 정보
export interface UserTagResponse {
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl: string | null;
}