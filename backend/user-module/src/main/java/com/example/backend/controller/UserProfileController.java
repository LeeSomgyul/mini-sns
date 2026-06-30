package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.UserProfileResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal JwtUser jwtUser
    ){
        UserProfileResponse response = userProfileService.getProfile(userId, jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("사용자 프로필 기본 정보 가져오기 성공", response));
    }
}
