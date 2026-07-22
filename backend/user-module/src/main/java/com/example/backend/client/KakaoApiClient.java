package com.example.backend.client;

import com.example.backend.dto.response.KakaoTokenResponse;
import com.example.backend.dto.response.KakaoUserInfoResponse;
import com.example.backend.exception.ExternalApiException;
import com.example.backend.exception.InvalidTokenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoApiClient {

    @Value("${kakao.admin-key}")
    private String kakaoAdminKey;

    @Value("${kakao.client-id}")
    private String kakaoRestAPIKey;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUrl;

    private final RestClient restClient = RestClient.create();

    // [카카오 연결 해제] 회원탈퇴
    // - providerUserId: 카카오 회원가입 시 카카오에서 제공해 준 사용자 id
    public void unlink(String providerUserId){
        // 1. 카카오 api 요청 형식
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("target_id_type", "user_id");
        body.add("target_id", providerUserId);

        // 2. 카카오 서버로 요청(restClient를 사용하여 외부 api와 연결)
        try{
            restClient.post()
                    .uri("https://kapi.kakao.com/v1/user/unlink")
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + kakaoAdminKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.error("[카카오 계정 연동 해제 성공] providerUserId: {}", providerUserId);
        }catch(Exception e){
            log.error("[카카오 계정 연동 해제 실패] providerUserId: {}", providerUserId, e);
            throw new ExternalApiException("카카오 계정 연동 해제에 실패했습니다.");
        }
    }

    // [Authorization Code로 카카오 AccessToken 발급] 로그인
    // 카카오 로그인 시도 시, url에 같이 넘겨주는 code로 카카오에 요청에서 accessToken가져오는 메서드
    public String getKakaoAccessToken(String authorizationCode){

        // 1. 카카오 api 요청 형식
        // 카카오 공식문서의 https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token-sample 참고
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id",kakaoRestAPIKey);
        body.add("redirect_uri", kakaoRedirectUrl);
        body.add("code", authorizationCode);

        try{
            // 2. 카카오 서버로 요청(restClient를 사용하여 외부 api와 연결)
            KakaoTokenResponse response = restClient.post()
                    .uri("https://kauth.kakao.com/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body) //카카오로 전송하는 값
                    .retrieve() //보내기 실행
                    .body(KakaoTokenResponse.class); //우리가 받아오려는 값으로 응답 받아오기

            return response.accessToken();
        }catch(Exception e){
            throw new InvalidTokenException("카카오 로그인 토큰 발급에 실패했습니다.");
        }
    }

    // [카카오 AccessToken으로 회원고유번호(userId) 조회]
    // 카카오 로그인 시도 시, 카카오에서 가져온 accessToken로 다시 userId를 가져오는 메서드
    public String getKakaoUserId(String accessToken){

        // 1. 카카오 서버로 요청(restClient를 사용하여 외부 api와 연결)
        // 카카오 공식문서의 https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info 참고
        try{
            KakaoUserInfoResponse response = restClient.get()
                    .uri("https://kapi.kakao.com/v2/user/me")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(KakaoUserInfoResponse.class);

            return String.valueOf(response.id());
        }catch(Exception e){
            throw new InvalidTokenException("카카오 유저 정보 조회에 실패했습니다.");
        }
    }
}
