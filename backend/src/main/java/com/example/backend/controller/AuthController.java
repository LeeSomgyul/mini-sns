package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.AuthService;
import com.example.backend.service.KakaoAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;

    //로그인 요청
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {

        //Service에서 토큰 결과 받아오기
        TokenResponse tokenResponse = authService.login(request);

        //응답(헤더에는 쿠키, 바디에는 JSON 전달)
        return createTokenResponse(tokenResponse);
    }

    //회원가입 요청
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<JoinResponse>> join(@Valid @RequestBody JoinRequest request){
        ApiResponse<JoinResponse> response = authService.join(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //카카오 로그인 요청
    @PostMapping("/kakao")
    public ResponseEntity<ApiResponse<LoginResponse>> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request){
        TokenResponse tokenResponse = kakaoAuthService.kakaoLogin(request);
        return createTokenResponse(tokenResponse);
    }

    //토큰 재발급
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<LoginResponse>> tokenReissue(
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

    //로그아웃 요청
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,//헤더 데이터 가져오기(토큰, 쿠키정보 등)
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        //헤더에서 accessToken 추출
        String bearerToken = request.getHeader("Authorization");
        String accessToken = "";
        if(bearerToken != null && bearerToken.startsWith("Bearer ")){
            accessToken = bearerToken.substring(7);
        }

        //로그아웃 실행
        ApiResponse<Void> logoutResponse = authService.logout(accessToken, userDetails.userId());

        //쿠키에서 refreshToken 제거
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .maxAge(0)//쿠키 만료시간을 0으로 만들어서 제거
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(logoutResponse);
    }

    //[공동 로직]: login과 tokenReissue 모두 사용
    private ResponseEntity<ApiResponse<LoginResponse>> createTokenResponse(TokenResponse response){

        //RefreshToken을 HttpOnly 쿠키로 굽기
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", response.refreshToken())
                .httpOnly(true)//자바스크립트가 쿠키 읽는거 막기
                .secure(false)//HTTPS에서만 연결? 🚨🚨배포할 때 true로 바꾸기🚨🚨
                .sameSite("Strict")//다른 사이트에서 요청할때 쿠키 보내지 않기
                .path("/")//브라우저 어떤 경로에서 모두 쿠키 포함
                .maxAge(604800)//만료 기간 7일
                .build();

        //프론트엔드에 보낼 응답 response에 담기
        LoginResponse loginData = LoginResponse.builder()
                .userId(response.userId())
                .nickname(response.nickname())
                .accessToken(response.accessToken())
                .expiresIn(1800)//accessToken은 만료 시간 30분
                .build();

        //합쳐서 모두 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("토큰 발급 완료", loginData));
    }
}
