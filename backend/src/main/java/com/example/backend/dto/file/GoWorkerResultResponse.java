package com.example.backend.dto.file;

import lombok.Builder;

@Builder
public record GoWorkerResultResponse (
        Long postId,
        String uniqueId,
        String thumbnailUrl,
        String videoUrl720p,
        String videoUrl1080p,
        String status
){}
