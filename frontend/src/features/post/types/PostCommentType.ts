// [댓글 생성] 요청
export interface PostCommentCreateRequest{
    content: string;
}

// [댓글 조회] 응답
export interface PostCommentResponse{
    content: FeedComment[];
    nextCursor: number;     //다음 페이지 번호
    hasNextPage: boolean;   //다음 페이지 존재 여부
};

export interface FeedComment{
    commentId: number;
    author: CommentAuthor;
    content: string;
    createdAt: string;
    isMine: boolean;        //내가 쓴 글인지 여부
    isEdited: boolean;      //댓글 수정 여부
}

export interface CommentAuthor{
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
}