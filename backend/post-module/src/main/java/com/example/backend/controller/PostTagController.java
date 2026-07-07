package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostTagResponse;
import com.example.backend.service.PostTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/posts")
@RequiredArgsConstructor
public class PostTagController {

    private final PostTagService postTagService;

    @GetMapping("/{postId}/tags")
    public ResponseEntity<ApiResponse<List<PostTagResponse>>> getPostTags(
            @PathVariable("postId") Long postId
    ){
        List<PostTagResponse> response = postTagService.getTagsByPostId(postId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("게시물 태그가 조회되었습니다.", response));
    }
}
