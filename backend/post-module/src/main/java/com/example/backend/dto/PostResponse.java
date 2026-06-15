package com.example.backend.dto;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import lombok.Builder;

import java.util.List;
import java.util.Map;

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
        public static TagUserResponse of(PostTag postTag, String nickname){
            return new TagUserResponse(
                    postTag.getUserId(),
                    nickname
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
                post.getTags().stream()
                        .map(tag -> {
                            // 💡 아직 닉네임을 모르니, 임시로 "사용자_숫자ID"로 프론트에 던져줍니다.
                            String tempNickname = "사용자_" + tag.getUserId();
                            return TagUserResponse.of(tag, tempNickname);
                        })
                        .toList()
        );
    }
}
