package com.example.backend.domain.feed.dto;

import com.example.backend.domain.post.entity.Post;
import com.example.backend.domain.post.entity.PostMedia;
import com.example.backend.domain.user.entity.User;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record FeedResponse (
        List<PostDto> posts,
        Long nextCursor,
        boolean hasNextPage
){
    public static FeedResponse of(List<PostDto> posts, Long nextCursor, boolean hasNextPage){
        return new FeedResponse(
              posts,
              nextCursor,
              hasNextPage
        );
    }

    @Builder
    public record PostDto(
            Long postId,
            AuthorDto author,
            String content,
            List<MediaDto> media,
            int commentCount,
            int likeCount,
            boolean isLiked,
            boolean isAuthor,
            LocalDateTime createdAt
    ){
        public static PostDto from (Post post, boolean isLiked, boolean isAuthor, List<MediaDto> mediaDtos){
            return new PostDto(
                    post.getId(),
                    AuthorDto.from(post.getAuthor()),
                    post.getContent(),
                    mediaDtos,
                    post.getCommnetCount(),
                    post.getLikeCount(),
                    isLiked,
                    isAuthor,
                    post.getCreatedAt()
            );
        }

        @Builder
        public record AuthorDto(
                Long userId,
                String nickname,
                String profileImageUrl
        ){
            public static AuthorDto from (User user){
                return new AuthorDto(
                    user.getId(),
                    user.getNickname(),
                    user.getProfileImageUrl()
                );
            }
        }

        @Builder
        public record MediaDto(
                String mediaUrl,
                String type,
                String thumbnailUrl,
                int sortOrder
        ){
            public static MediaDto from (PostMedia postMedia){
                return new MediaDto(
                    postMedia.getUrl(),
                    postMedia.getMediaType().name(),
                    postMedia.getThumbnailUrl(),
                    postMedia.getSortOrder()
                );
            }
        }
    }
}
