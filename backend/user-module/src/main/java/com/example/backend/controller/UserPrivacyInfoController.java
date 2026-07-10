package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.UserPrivacyInfoResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.UserPrivacyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserPrivacyInfoController {

    private final UserPrivacyInfoService userPrivacyInfoService;

    // [프로필 개인정보 리스트 조회]
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserPrivacyInfoResponse>> getUserPrivacyInfo (
            @AuthenticationPrincipal JwtUser jwtUser
    ){
        UserPrivacyInfoResponse response = userPrivacyInfoService.getUserPrivacyInfo(jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("프로필 개인정보를 조회하였습니다.", response));
    }
}
