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
                    post.getCommentCount(),
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
                int sortOrder,
                String status
        ){
            public static MediaDto from (PostMedia postMedia, String baseStorageUrl){
                //[DB에 저장된 "/post..."형식 url을 전체 경로 형식으로 변형]
                String dbPath = postMedia.getUrl();
                String dbThumbPath = postMedia.getThumbnailUrl();

                // 1.미디어 url 변경
                String finalMediaUrl = null;
                if(dbPath != null){
                    // 만약 경로 앞부분에 버킷명이 들어있다면 제거
                    if(dbPath.startsWith("/mini-sns/")){
                        dbPath = dbPath.replace("/mini-sns/", "");
                    }

                    finalMediaUrl = baseStorageUrl + "/" + dbPath;
                }

                // 2.썸네일 url 변경
                String finalThumbmailUrl = null;
                if(dbThumbPath != null){
                    if(dbThumbPath.startsWith("/mini-sns/")){
                        dbThumbPath = dbThumbPath.replace("/mini-sns/", "");
                    }

                    finalThumbmailUrl = baseStorageUrl + "/" + dbThumbPath;
                }

                // 3. 변형된 url로 프론트 응답
                return new MediaDto(
                    finalMediaUrl,
                    postMedia.getMediaType().name(),
                    finalThumbmailUrl,
                    postMedia.getSortOrder(),
                    postMedia.getStatus().name()
                );
            }
        }
    }
}
