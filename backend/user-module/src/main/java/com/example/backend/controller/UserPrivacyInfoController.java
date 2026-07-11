package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.UserPrivacyInfoUpdateRequest;
import com.example.backend.dto.response.NicknameCheckResponse;
import com.example.backend.dto.response.UserPrivacyInfoResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.UserPrivacyInfoService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserPrivacyInfoController {

    private final UserService userService;
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

    // [프로필 개인정보 수정]
    // - 프론트엔드가 uppy로 MiniO에 프로필 이미지 업로드를 실행한 후,
    //   해당 Object Key(url)와 수정된 텍스트 필드들을 JSON 형식으로 전달
    @PatchMapping(value = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateUserPrivacyInfo(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestBody @Valid UserPrivacyInfoUpdateRequest request
    ){
        userPrivacyInfoService.updateUserPrivacyInfo(jwtUser.userId(), request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("프로필 정보가 수정되었습니다.", null));
    }

    // [프로필 개인정보 수정 시 닉네임 중복 체크]
    // - 회원가입 시 사용한 service 재사용
    @GetMapping("/me/nickname/exists")
    public ResponseEntity<ApiResponse<NicknameCheckResponse>> checkNicknameForEdit(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestParam String nickname
    ){
        NicknameCheckResponse response = userService.checkNicknameDuplicate(nickname, jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("닉네임 중복체크를 완료했습니다.", response));
    }
}
