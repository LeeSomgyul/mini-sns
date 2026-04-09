package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    //로그인 요청
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        //Service에서 토큰 결과 받아오기
        TokenResponse tokenResponse = authService.login(request);

        //응답(헤더에는 쿠키, 바디에는 JSON 전달)
        return createTokenResponse(tokenResponse);
    }

    //회원가입 요청
    @PostMapping("/join")
    public ResponseEntity<JoinResponse> join(@Valid @RequestBody JoinRequest request){
        JoinResponse response = authService.join(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //토큰 재발급
    @PostMapping("/reissue")
    public ResponseEntity<LoginResponse> tokenReissue(
            @CookieValue(value = "refreshToken", required = false)
            String refreshToken
    ){
        //refreshToken이 유효하지 않거나 만료된 경우
        if(refreshToken == null){
            throw new InvalidTokenException("유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        TokenResponse tokenResponse = authService.tokenReissue(refreshToken);

        return createTokenResponse(tokenResponse);
    }

    //[공동 로직]: login과 tokenReissue 모두 사용
    private ResponseEntity<LoginResponse> createTokenResponse(TokenResponse response){

        //RefreshToken을 HttpOnly 쿠키로 굽기
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", response.refreshToken())
                .httpOnly(true)//자바스크립트가 쿠키 읽는거 막기
                .secure(false)//HTTPS에서만 연결? 🚨🚨배포할 때 true로 바꾸기🚨🚨
                .sameSite("Strict")//다른 사이트에서 요청할때 쿠키 보내지 않기
                .path("/")//브라우저 어떤 경로에서 모두 쿠키 포함
                .maxAge(604800)//만료 기간 7일
                .build();

        //프론트엔드에 보낼 응답 response에 담기
        LoginResponse responseBody = LoginResponse.builder()
                .status("success")
                .data(LoginResponse.Data.builder()
                        .userId(response.userId())
                        .nickname(response.nickname())
                        .accessToken(response.accessToken())
                        .expiresIn(1800)//accessToken은 만료 시간 30분
                        .build())
                .build();

        //합쳐서 모두 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(responseBody);
    }
}
