package com.example.backend.dto;

import lombok.Builder;

import java.time.LocalDateTime;
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
    ){}

    @Builder
    public record TagUserResponse(
            Long userId,
            String nickname
    ){}
}
