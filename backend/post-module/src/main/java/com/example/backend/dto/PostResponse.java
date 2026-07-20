package com.example.backend.dto;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import lombok.Builder;

import java.util.List;
import java.util.Map;

public record PostResponse (
        Long postId,
        Long authorId,
        String thumbnailUrl,
        List<MediaResponse> mediaList,
        String content,
        List<TagUserResponse> tagUsers
){
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

    public record TagUserResponse(
            Long userId,
            String nickname
    ){
        public static TagUserResponse of(PostTag postTag, String nickname){
            return new TagUserResponse(
                    postTag.getUserId(),
                    nickname
            );
        }
    }

    public static PostResponse of (Post post, Long authorId, Map<Long, String> nicknames){
        return new PostResponse(
                post.getId(),
                authorId,
                post.getThumbnailUrl(),
                post.getMediaList().stream().map(MediaResponse::from).toList(),
                post.getContent(),
                post.getTags().stream()
                        .map(tag -> {
                            String nickname = nicknames.get(tag.getId());
                            return TagUserResponse.of(tag, nickname);
                        })
                        .toList()
        );
    }
}
