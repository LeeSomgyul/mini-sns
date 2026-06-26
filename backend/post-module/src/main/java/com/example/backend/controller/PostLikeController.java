package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/posts")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    // 1. 좋아요 등록
    @PostMapping("/{postId}/likes")
    public ResponseEntity<ApiResponse<Void>> addLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUser jwtUser
            ){
        postLikeService.addLike(postId, jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("게시물 좋아요 등록 완료", null));
    }

    // 2. 좋아요 취소
    @DeleteMapping("/{postId}/likes")
    public ResponseEntity<ApiResponse<Void>> cancelLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUser jwtUser
    ){
        postLikeService.cancelLike(postId, jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("게시물 좋아요 취소 완료", null));
    }
}
