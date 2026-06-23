package com.example.backend.dto;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import lombok.Builder;

import java.util.List;

@Builder
public record PostEditResponse(
        Long postId,
        Long authorId,
        String thumbnailUrl,
        List<PostEditResponse.MediaResponse> mediaList,
        String content,
        List<PostEditResponse.TagUserResponse> tagUsers
) {
    @Builder
    public record MediaResponse(
            Long mediaId,
            String type,
            String url,
            String thumbnailUrl,
            int sortOrder
    ){
        public static PostEditResponse.MediaResponse from (PostMedia postMedia){
            return new PostEditResponse.MediaResponse(
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
        public static PostEditResponse.TagUserResponse of(PostTag postTag, String nickname){
            return new PostEditResponse.TagUserResponse(
                    postTag.getUserId(),
                    nickname
            );
        }
    }

    public static PostEditResponse of (Post post, Long authorId){
        return new PostEditResponse(
                post.getId(),
                authorId,
                post.getThumbnailUrl(),
                post.getMediaList().stream().map(PostEditResponse.MediaResponse::from).toList(),
                post.getContent(),
                post.getTags().stream()
                        .map(tag -> {
                            //🚨아직 닉네임을 모르니, 임시로 "사용자_숫자ID"로 프론트에 던져줍니다.🚨
                            String tempNickname = "사용자_" + tag.getUserId();
                            return PostEditResponse.TagUserResponse.of(tag, tempNickname);
                        })
                        .toList()
        );
    }
}
