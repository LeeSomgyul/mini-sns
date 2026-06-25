package com.example.backend.dto;

public record PostLikeRequest(
        Long userId,
        boolean isLiked // ture: 좋아요 등록, false: 좋아요 취소
) {
}
