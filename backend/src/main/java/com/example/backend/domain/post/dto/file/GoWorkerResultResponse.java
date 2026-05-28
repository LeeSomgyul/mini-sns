package com.example.backend.domain.post.dto.file;

import lombok.Builder;

@Builder
public record GoWorkerResultResponse (
        Long postId,
        String uniqueId,
        String thumbnailUrl,
        String masterUrl,
        String status
){}
