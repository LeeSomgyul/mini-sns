// [인증 관련]
export const AUTH_KEYS = {
    all: ['auth'] as const,

    // 토큰 재발급
    reissue: () => [...AUTH_KEYS.all, 'reissue'] as const, 
};

// [피드 관련]
export const FEED_KEYS = {
    all: ['feeds'] as const,

    // 무한 스크롤 및 목록 조회
    lists: (size?: number) => (size 
        ? [...FEED_KEYS.all, 'list', {size}] as const
        : [...FEED_KEYS.all, 'list'] as const
    ),
};

// [게시물 관련]
export const POST_KEYS = {
    all: ['posts'] as const,

    // postId 별 데이터
    detail: (postId: number) => [...POST_KEYS.all, postId] as const,

    // 각 postId에 해당하는 미디어 데이터
    media: (postId: number) => [...POST_KEYS.detail(postId), 'media'] as const,

    // 각 postId에 해당하는 태그 정보
    tagUsers: (postId: number, userIds: number[]) => 
        [...POST_KEYS.detail(postId), 'tagUsers', {ids: userIds.join(',')}] as const,
};

// [사용자 관련]
export const USER_KEYS = {
    all: ['users'] as const,
    
    // all, frineds 카테고리에 따른 키 생성
    search: (keyword: string, type: 'all' | 'friends' = 'all') => 
        [...USER_KEYS.all, 'search', type, keyword] as const,
};