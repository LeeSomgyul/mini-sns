package com.example.backend.service;

import com.example.backend.dto.KakaoLoginRequest;
import com.example.backend.dto.KakaoTokenResponse;
import com.example.backend.dto.KakaoUserInfoResponse;
import com.example.backend.dto.TokenResponse;
import com.example.backend.entity.SocialAccount;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.repository.SocialAccountRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    @Value("${kakao.client-id}")
    private String kakaoRestAPIKey;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUrl;

    private final RestClient restClient = RestClient.create();
    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

    //카카오 로그인
    @Transactional
    public TokenResponse kakaoLogin(KakaoLoginRequest request){

        //카카오 서버 통신(토큰 및 유저 정보 획득)
        String kakaoAccessToken = getKakaoAccessToken(request.authorizationCode());//1단계: 토큰 획득
        String kakaoUserId = getKakaoUserId(kakaoAccessToken);

        //이미 존재하는 사용자인지 확인
        SocialAccount socialAccount = socialAccountRepository.findByProviderUserId(kakaoUserId).orElse(null);
        User user;

        if(socialAccount != null){
            user = socialAccount.getUser();//기존 사용자라면 정보 가져오기
            user.updateDeviceToken(request.deviceToken());//로그인 할때마다 해당 기기 정보 가져오기
        }else{
            //신규 사용자 처리
            String randomNickname = "신규" + UUID.randomUUID().toString().substring(0,6).toUpperCase();//랜덤 닉네임 생성
            user = User.builder()
                    .nickname(randomNickname)
                    .deviceToken(request.deviceToken())
                    .build();
            userRepository.save(user);

            socialAccount = SocialAccount.builder()
                    .user(user)
                    .provider("KAKAO")
                    .providerUserId(kakaoUserId)
                    .build();
            socialAccountRepository.save(socialAccount);
        }

        //우리 서비스 전용 access, refresh 토큰 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getNickname());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        //Redis의 refreshToken 저장
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.getId(),
                newRefreshToken,
                Duration.ofDays(7)
        );

        return TokenResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    //카카오 로그인 시도 시, url에 같이 넘겨주는 code로 카카오에 요청에서 accessToken가져오는 메서드
    private String getKakaoAccessToken(String authorizationCode){

        //요청 바구니: 카카오 공식문서의 https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token-sample 참고
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id",kakaoRestAPIKey);
        body.add("redirect_uri", kakaoRedirectUrl);
        body.add("code", authorizationCode);

        try{
            //카카오 서버로 요청(restClient를 사용하여 외부 api와 연결)
            KakaoTokenResponse response = restClient.post()
                    .uri("https://kauth.kakao.com/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)//우리가 만든 요청 바구니
                    .retrieve()//보내기 실행
                    .body(KakaoTokenResponse.class);//우리가 받아오려는 값으로 응답 받아오기

            return response.accessToken();
        }catch(Exception e){
            throw new InvalidTokenException("카카오 로그인 토큰 발급에 실패했습니다.");
        }
    }

    //카카오 로그인 시도 시, 카카오에서 가져온 accessToken로 다시 userId를 가져오는 메서드
    private String getKakaoUserId(String accessToken){

        //요청 바구니: 카카오 공식문서의 https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info 참고
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
