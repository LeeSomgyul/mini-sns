package com.example.backend.controller;


import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.JoinRequest;
import com.example.backend.dto.request.KakaoLoginRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.JoinResponse;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.dto.response.TokenResponse;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.AuthService;
import com.example.backend.service.KakaoAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;

    // [로그인]
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {

        //Service에서 토큰 결과 받아오기
        TokenResponse tokenResponse = authService.login(request);

        //응답(헤더에는 쿠키, 바디에는 JSON 전달)
        return createTokenResponse(tokenResponse);
    }

    // [회원가입]
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<JoinResponse>> join(@Valid @RequestBody JoinRequest request){
        ApiResponse<JoinResponse> response = authService.join(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // [카카오 로그인]
    @PostMapping("/kakao")
    public ResponseEntity<ApiResponse<LoginResponse>> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request){
        TokenResponse tokenResponse = kakaoAuthService.kakaoLogin(request);
        return createTokenResponse(tokenResponse);
    }

    // [토큰 재발급]
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

    // [로그아웃]
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestHeader(value = "Authorization", required = true) String bearerToken
    ){
        // 1. 헤더에서 accessToken 추출
        String accessToken = extractAccessToken(bearerToken);

        // 2. 로그아웃 실행
        ResponseCookie response = authService.logout(jwtUser.userId(), accessToken);

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, response.toString())
                .body(ApiResponse.success("로그아웃이 완료되었습니다.", null));
    }

    // [회원탈퇴] 유저 소프트 삭제
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestHeader(value = "Authorization", required = true) String bearerToken
    ){
        // 1. 헤더에서 accessToken 추출
        String accessToken = extractAccessToken(bearerToken);

        // 2. 회원탈퇴 실행
        ResponseCookie response = authService.softDeleteUser(jwtUser.userId(), accessToken);

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, response.toString())
                .body(ApiResponse.success("회원탈퇴가 완료되었습니다.", null));
    }



    // ==================== [메서드] ====================
    // [공동 로직]: login과 tokenReissue 모두 사용
    private ResponseEntity<ApiResponse<LoginResponse>> createTokenResponse(TokenResponse response){

        //RefreshToken을 HttpOnly 쿠키로 굽기
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", response.refreshToken())
                .httpOnly(true)//자바스크립트가 쿠키 읽는거 막기
                .secure(false)//HTTPS에서만 연결? 🚨🚨배포할 때 true로 바꾸기🚨🚨
                .sameSite("Strict")//다른 사이트에서 요청할때 쿠키 보내지 않기
                .path("/")//브라우저 어떤 경로에서 모두 쿠키 포함
                .maxAge(604800)//만료 기간 7일
                .build();

        //합쳐서 모두 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("토큰 발급 완료", LoginResponse.from(response)));
    }

    // [AccessToken 추출]
    private String extractAccessToken(String bearerToken){
        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }

}
