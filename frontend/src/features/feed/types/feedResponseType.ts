type backendMediaType = 'IMAGE' | 'VIDEO';
type backendProcessType = 'PROCESSING' | 'COMPLETED' | 'FAILED';

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
    commentCount?: number;
    likeCount: number;
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
    status: backendProcessType;
    cropState: string | null;
}

