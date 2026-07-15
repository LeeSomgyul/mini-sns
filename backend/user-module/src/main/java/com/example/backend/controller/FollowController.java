package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.FollowRequest;
import com.example.backend.dto.response.FollowResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.FollowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // [팔로우]
    @PostMapping
    public ResponseEntity<ApiResponse<FollowResponse>> follow(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestBody @Valid FollowRequest request
    ){
        FollowResponse response = followService.follow(jwtUser.userId(), request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("팔로우 하였습니다.", response));
    }
}
