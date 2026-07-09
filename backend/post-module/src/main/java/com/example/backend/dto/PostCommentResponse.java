package com.example.backend.dto;

import java.time.Instant;
import java.util.List;

public record PostCommentResponse(
        List<CommentContentResponse> content,
        Long nextCursor,
        boolean hasNextPage
) {
    public static PostCommentResponse of (List<CommentContentResponse> content, Long nextCursor, boolean hasNextPage){
        return new PostCommentResponse(content, nextCursor, hasNextPage);
    }

    public record CommentContentResponse(
            Long commentId,
            CommentAuthorResponse author,
            String content,
            Instant createdAt,
            boolean isMine,
            boolean isEdited
    ){
        public static CommentContentResponse of (Long commentId, CommentAuthorResponse author, String content, Instant createdAt, boolean isMine, boolean isEdited){
            return new CommentContentResponse(commentId, author, content, createdAt, isMine, isEdited);
        }

        public record CommentAuthorResponse(
                Long userId,
                String nickname,
                String profileImageUrl
        ){
            public static CommentAuthorResponse of (Long userId, String nickname, String profileImageUrl){
                return new CommentAuthorResponse(userId, nickname, profileImageUrl);
            }
        }
    }
}
