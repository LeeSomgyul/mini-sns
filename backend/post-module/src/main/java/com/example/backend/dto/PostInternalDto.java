package com.example.backend.dto;

import com.example.backend.entity.Post;
import com.example.backend.entity.UserCache;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

// [feed 모듈과의 내부 통신용 양식]
// feed 모듈이 요청한 아래 데이터 양식들을 전송해야함
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

    public static PostInternalDto from (UserCache userCache, Post post, Long currentUserId, boolean isLiked){

        boolean isAuthor = post.getAuthorId().equals(currentUserId);

        Author authorDto = new Author(
                post.getAuthorId(),
                userCache.getNickname(),
                userCache.getProfileImageUrl()
        );

        List<Media> mediaDto = post.getMediaList().stream()
                .map(m -> new Media(
                        m.getUrl(),
                        m.getThumbnailUrl(),
                        m.getMediaType().name(),
                        m.getSortOrder(),
                        m.getStatus().name(),
                        m.getCropState()
                )).toList();

        return new PostInternalDto(
                post.getId(),
                authorDto,
                post.getContent(),
                mediaDto,
                post.getCommentCount(),
                post.getLikeCount(),
                isLiked,
                isAuthor,
                post.getCreatedAt()
        );
    }
}
