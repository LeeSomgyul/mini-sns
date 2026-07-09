package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostCommentRequest;
import com.example.backend.dto.PostCommentResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.PostCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/posts")
@RequiredArgsConstructor
public class PostCommentController {

    private final PostCommentService postCommentService;

    // [댓글 추가]
    @PostMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<Long>> createComment(
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal JwtUser jwtUser,
            @Valid @RequestBody PostCommentRequest request
    ){
        Long commentId = postCommentService.createComment(postId, jwtUser.userId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("게시물 댓글 등록 완료", commentId));
    }

    // [특정 게시물의 댓글 목록 조회]
    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<PostCommentResponse>> getComments(
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestParam(value = "cursor", required = false) Long cursor,
            @RequestParam(value = "size", defaultValue = "10") int size
    ){
        PostCommentResponse response = postCommentService.getComments(postId, cursor, size, jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("게시물 댓글 조회 완료", response));
    }
}
