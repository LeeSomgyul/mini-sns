// [인증]
export const AUTH_KEYS = {
    all: ['auth'] as const,

    // 1. 토큰 재발급
    // 예: ['auth', 'reissue']
    reissue: () => [...AUTH_KEYS.all, 'reissue'] as const, 
};

// [피드]
export const FEED_KEYS = {
    all: ['feeds'] as const,

    // 피드 목록 조회 (무한 스크롤)
    // 예: ['feeds', 'list'] 또는 ['feeds', 'list', { size: 5 }]
    lists: (size?: number) => (size 
        ? [...FEED_KEYS.all, 'list', {size}] as const
        : [...FEED_KEYS.all, 'list'] as const
    ),

    // 모든 단건 피드 그룹 정의
    // 예: ['feeds', 'detail']
    details: () => [...FEED_KEYS.all, 'detail'] as const,

    // 특정 단건 피드 조회
    // 예: ['feeds', 'detail', 42]
    detail: (postId: number | null) => (postId
        ? [...FEED_KEYS.details(), postId] as const
        : [...FEED_KEYS.details()] as const
    )
};

// [게시물]
export const POST_KEYS = {
    all: ['posts'] as const,

    // 특정 게시물 상세 데이터
    // 예: ['posts', 42]
    detail: (postId: number) => [...POST_KEYS.all, postId] as const,

    // 특정 게시물의 미디어 데이터
    // 예: ['posts', 42, 'media']
    media: (postId: number) => [...POST_KEYS.detail(postId), 'media'] as const,

    // 특정 게시물 내 태그된 사용자 그룹 데이터
    // 예: ['posts', 42, 'tagUsers', { ids: '1,3,5' }]
    tagUsers: (postId: number, userIds: number[]) => 
        [...POST_KEYS.detail(postId), 'tagUsers', {ids: userIds.join(',')}] as const,

    // 각 게시물 태그 정보
    // 예: ['posts', 42, 'tags']
    tags: (postId: number) => [...POST_KEYS.detail(postId), 'tags'] as const,

    // 각 게시물 댓글 목록
    // 예: ['posts', 42, 'comments']
    comments: (postId: number) => [...POST_KEYS.detail(postId), 'comments'] as const,
};

// [사용자]
export const USER_KEYS = {
    all: ['users'] as const,
    
    // 키워드 및 타입별 사용자 검색
    // 예: ['users', 'search', 'friends', '홍길동']
    search: (keyword: string, type: 'all' | 'friends' = 'all') => 
        [...USER_KEYS.all, 'search', type, keyword] as const,

    // 전달받은 userIds 기반 프로필 요약 정보 (태그용)
    // 예: ['users', 'tags', { ids: '1,2,3' }]
    tags: (userIds: number[]) => [...USER_KEYS.all, 'tags', {dis: userIds.join(',')}] as const,

    // 로그인한 사용자 본인의 내 정보
    // 예: ['users', 'me']
    me: () => [...USER_KEYS.all, "me"] as const,

    // 가입/정보변경 시 닉네임 중복 검증
    // 예: ['users', 'checkNickname', 'active_user']
    checkNickname: (nickname: string) => [...USER_KEYS.all, 'checkNickname', nickname] as const
};

// [프로필]
export const PROFILE_KEYS = {
    all: ['profile'] as const,

    // 프로필 유저 정보 기본 경로
    // 예: ['profile', 'user']
    users: () => [...PROFILE_KEYS.all, 'user'] as const,
    
    // 특정 유저의 상세 프로필 정보
    // 예: ['profile', 'user', 10]
    user: (userId: number) => [...PROFILE_KEYS.users(), userId] as const,

    // 프로필 유저 게시물 기본 경로
    // 예: ['profile', 'post']
    posts: () => [...PROFILE_KEYS.all, 'post'] as const,
    
    // 특정 유저의 프로필 하단 게시물 목록
    // 예: ['profile', 'post', 10]
    post: (userId: number) => [...PROFILE_KEYS.posts(), userId] as const,
};

// [팔로우]
export const FOLLOW_KEYS = {
    all: ['follows'] as const,

    // 팔로잉(내가 팔로우 하는 사람들) 전체 그룹 정보
    // 예: ['follows', 'followings']
    followingsAll: () => [...FOLLOW_KEYS.all, 'followings'] as const,

    // 특정 사용자의 팔로잉 목록 (무한스크롤)
    // 예: ['follows', 'followings', 10]
    followings: (userId: number) => [...FOLLOW_KEYS.followingsAll(), userId] as const,

    // 팔로워(나를 팔로우 하는 사람들) 전체 그룹 정보
    // 예: ['follows', 'followers']
    followersAll: () => [...FOLLOW_KEYS.all, 'followers'] as const,

    // 특정 사용자의 팔로워 목록 (무한스크롤)
    // 예: ['follows', 'followers', 10]
    followers: (userId: number) => [...FOLLOW_KEYS.followersAll(), userId] as const,
}
