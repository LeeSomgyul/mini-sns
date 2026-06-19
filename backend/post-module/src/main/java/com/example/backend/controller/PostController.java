package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostRequest;
import com.example.backend.dto.PostResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/posts")
public class PostController {

    private final PostService postService;

    // [최종 게시물 등록]
    //프론트가 minio에 파일 업로드 완료 후, 해당 경로 및 게시물에 대한 데이터를 DB에 저장
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPost (
            @AuthenticationPrincipal JwtUser jwtUser,//사용자 검증
            @RequestBody @Valid PostRequest request
    ){
        //request: 프론트가 minio에 올린 데이터
        PostResponse postResponse = postService.createPost(jwtUser.userId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("게시물이 등록되었습니다.", postResponse));
    }

    // [게시물 삭제]
    public ResponseEntity<ApiResponse<Void>> deletePost(
        @PathVariable Long postId,
        @AuthenticationPrincipal JwtUser jwtUser
    ){
        postService.deletePost(postId, jwtUser.userId());
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("게시물이 삭제되었습니다.", null));
    }
}
