type backendMediaType = 'IMAGE' | 'VIDEO';

export interface FeedResponse{
    posts: PostDto[];
    nextCursor: number;
    hasNextPage: boolean;
}

export interface PostDto{
    postId: number;
    author: AuthorDto;
    content: string;
    media: MediaDto[];
    commentCount?: number; //🚨댓글, 좋아요 기능 완료 후 '?' 제거하기🚨
    likeCount?: number;
    isLiked?: boolean;
    isAuthor: boolean;
    createdAt: string;
}

export interface AuthorDto{
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
}

export interface MediaDto{
    mediaUrl: string;
    type: backendMediaType;
    thumbnailUrl: string | null;
    sortOrder: number;
}

