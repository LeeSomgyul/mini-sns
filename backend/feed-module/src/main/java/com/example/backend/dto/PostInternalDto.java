package com.example.backend.dto;


import java.time.LocalDateTime;
import java.util.List;

// [post 모듈과의 내부 통신용 양식]
// request(post모듈에게 아래 양식 요청) & response(아래 형식대로 받아오기) 역할을 동시에 함
public record PostInternalDto(
        Long postId,
        Author author,
        String content,
        List<Media> media,
        int commentCount,
        int likeCount,
        boolean isLiked,
        boolean isAuthor,
        LocalDateTime createdAt
) {
    public record Author(
            Long userId,
            String nickname,
            String profileImageUrl
    ){}

    public record Media(
            String mediaUrl,
            String type,
            String thumbnailUrl,
            int sortOrder,
            String status,
            String cropState
    ){}
}
