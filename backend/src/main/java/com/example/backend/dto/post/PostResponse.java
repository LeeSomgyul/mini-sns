package com.example.backend.dto.post;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import lombok.Builder;

import java.util.List;

@Builder
public record PostResponse (
        Long postId,
        Long authorId,
        String thumbnailUrl,
        List<MediaResponse> mediaList,
        String content,
        List<TagUserResponse> tagUsers
){
    @Builder
    public record MediaResponse(
            Long mediaId,
            String type,
            String url,
            String thumbnailUrl,
            int sortOrder
    ){
        public static MediaResponse from (PostMedia postMedia){
            return new MediaResponse(
                    postMedia.getId(),
                    postMedia.getMediaType().name(),
                    postMedia.getUrl(),
                    postMedia.getThumbnailUrl(),
                    postMedia.getSortOrder()
            );
        }
    }

    @Builder
    public record TagUserResponse(
            Long userId,
            String nickname
    ){
        public static TagUserResponse from (PostTag postTag){
            return new TagUserResponse(
                    postTag.getUser().getId(),
                    postTag.getUser().getNickname()
            );
        }
    }

    public static PostResponse of (Post post, Long authorId){
        return new PostResponse(
                post.getId(),
                authorId,
                post.getThumbnailUrl(),
                post.getMediaList().stream().map(MediaResponse::from).toList(),
                post.getContent(),
                post.getTags().stream().map(TagUserResponse::from).toList()
        );
    }
}
