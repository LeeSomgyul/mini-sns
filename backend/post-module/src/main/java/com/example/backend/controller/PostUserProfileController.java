package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostUserProfileResponse;
import com.example.backend.service.PostUserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/posts")
@RequiredArgsConstructor
public class PostUserProfileController {

    private final PostUserProfileService postUserProfileService;

    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<PostUserProfileResponse>> getPostUserProfile(
            @PathVariable Long userId
    ){
        PostUserProfileResponse response = postUserProfileService.getPostUserProfile(userId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("프로필 게시물 업데이트 완료", response));
    }
}
