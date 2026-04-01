package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.TokenResponse;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        //1.Service에서 토큰 결과 받아오기
        TokenResponse tokenResponse = authService.login(request);

        //2.RefreshToken을 HttpOnly 쿠키로 굽기
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenResponse.refreshToken())
                .httpOnly(true)//자바스크립트가 쿠키 읽는거 막기
                .secure(false)//HTTPS에서만 연결? 🚨🚨배포할 때 true로 바꾸기🚨🚨
                .sameSite("Strict")//다른 사이트에서 요청할때 쿠키 보내지 않기
                .path("/")//브라우저 어떤 경로에서 모두 쿠키 포함
                .maxAge(604800)//만료 기간 7일
                .build();



        //3.프론트엔드에 보낼 응답 response에 담기
        LoginResponse responseBody = new LoginResponse(
                "success",
                new LoginResponse.Data(
                        tokenResponse.userId(),
                        tokenResponse.nickname(),
                        tokenResponse.accessToken(),
                        1800//accessToken은 만료 시간 30분
                )
        );
        /*
        LoginResponse responseBody = LoginResponse.builder()
                .status("success")
                .data(LoginResponse.Data.builder()
                        .userId(tokenResponse.getUserId())
                        .nickname(tokenResponse.getNickname())
                        .accessToken(tokenResponse.getAccessToken())
                        .expiresIn(1800)
                        .build())
                .build();
        */

        //4.응답(헤더에는 쿠키, 바디에는 JSON 전달)
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(responseBody);
    }
}
