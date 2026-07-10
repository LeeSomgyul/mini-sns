// [인증 관련]
export const AUTH_KEYS = {
    all: ['auth'] as const,

    // 토큰 재발급
    reissue: () => [...AUTH_KEYS.all, 'reissue'] as const, 
};

// [피드 관련]
export const FEED_KEYS = {
    all: ['feeds'] as const,

    // 목록 조회 및 무한 스크롤
    lists: (size?: number) => (size 
        ? [...FEED_KEYS.all, 'list', {size}] as const
        : [...FEED_KEYS.all, 'list'] as const
    ),

    // 프로필 단건 게시물 조회
    details: () => [...FEED_KEYS.all, 'detail'] as const,
    // ['feeds', 'detail', postId]
    detail: (postId: number | null) => (postId
        ? [...FEED_KEYS.details(), postId] as const
        : [...FEED_KEYS.details()] as const
    )
};

// [게시물 관련]
export const POST_KEYS = {
    all: ['posts'] as const,

    // postId 별 데이터
    detail: (postId: number) => [...POST_KEYS.all, postId] as const,

    // 각 postId에 해당하는 미디어 데이터
    media: (postId: number) => [...POST_KEYS.detail(postId), 'media'] as const,

    // 각 게시물의 해당하는 태그 정보
    tagUsers: (postId: number, userIds: number[]) => 
        [...POST_KEYS.detail(postId), 'tagUsers', {ids: userIds.join(',')}] as const,

    // 각 게시물의 태그 정보를 가져오는 키
    tags: (postId: number) => [...POST_KEYS.detail(postId), 'tags'] as const,

    // 각 게시물의 댓글 목록을 가져오는 키
    comments: (postId: number) => [...POST_KEYS.detail(postId), 'comments'] as const,
};

// [사용자 관련]
export const USER_KEYS = {
    all: ['users'] as const,
    
    // all, frineds 카테고리에 따른 키 생성
    search: (keyword: string, type: 'all' | 'friends' = 'all') => 
        [...USER_KEYS.all, 'search', type, keyword] as const,

    // 넘겨받은 userIds 배열을 기반으로 프로필 정보(닉네임, 이름, 프로필사진)를 가져오는 키
    tags: (userIds: number[]) => [...USER_KEYS.all, 'tags', {dis: userIds.join(',')}] as const,

    // 사용자의 프로필 개인정보 편집용 데이터 
    me: () => [...USER_KEYS.all, "me"] as const,
};

// [프로필 관련]
export const PROFILE_KEYS = {
    all: ['profile'] as const,

    // user 모듈에서 가져오는 기본 유저 정보
    users: () => [...PROFILE_KEYS.all, 'user'] as const,
    // 특정 유저의 상세 프로필 키 ['profile', 'user', userId]
    user: (userId: number) => [...PROFILE_KEYS.users(), userId] as const,

    // post 모듈에서 가져오는 유저 게시물 정보
    posts: () => [...PROFILE_KEYS.all, 'post'] as const,
    // 특정 유저의 상세 게시물 프로필 키 ['profile', 'post', userId]
    post: (userId: number) => [...PROFILE_KEYS.posts(), userId] as const,
};