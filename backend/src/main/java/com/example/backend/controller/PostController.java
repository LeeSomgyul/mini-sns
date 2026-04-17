package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostRequest;
import com.example.backend.dto.PostResponse;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)//폼 데이터로 파일데이터를 받는다는 의미
    public ResponseEntity<ApiResponse<PostResponse>> createPost (
            @AuthenticationPrincipal CustomUserDetails userDetails,//사용자 검증
            @RequestPart(value = "request") @Valid PostRequest request,//사용자가 추가한 본문내용, 태그목록
            @RequestPart(value = "files")List<MultipartFile> files//사용자가 추가한 미디어
            ){

        ApiResponse<PostResponse> postData = postService.createPost(userDetails.userId(), request, files);

        return ResponseEntity.status(HttpStatus.CREATED).body(postData);
    }
}
