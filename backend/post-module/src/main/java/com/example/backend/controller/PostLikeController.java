package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostLikeRequest;
import com.example.backend.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/posts")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping("/{postId}/likes")
    public ResponseEntity<ApiResponse<Void>> toggleLike(
            @PathVariable Long postId,
            @RequestBody PostLikeRequest request
    ){
        postLikeService.toggleLike(postId, request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("게시물 좋아요 비동기 처리 완료", null));
    }
}
