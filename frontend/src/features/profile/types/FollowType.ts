// [팔로우 요청]
export interface FollowRequest{
    targetUserId: number;
}

export interface FollowResponse{
    followerId: number;
    followingId: number;
    status: string;
}


// [언팔로우 요청]
export interface UnfollowRequest{
    targetUserId: number;
}

export interface UnfollowResponse{
    followerId: number;
    followingId: number;
    status: string;
}


// [팔로잉 목록 조회] ID 가 userId인 사용자의 팔로잉 목록 조회
// [팔로우 목록 조회] ID 가 userId인 사용자의 팔로우 목록 조회
export interface FollowUserRequest{
    userId: number;
    cursor: number | null; // 첫 조회 시 null, 이후엔 nextCursor 주입
    size?: number;
}

export interface FollowUserResponse{
    content: FollowContentDto[];
    nextCursor: number;
    hasNextPage: boolean;
}

export interface FollowContentDto{
    userId: number;
    nickname: string;
    name: string;
    profileImageUrl: string;
}


