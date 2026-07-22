package com.example.backend.service;

import com.example.backend.client.KakaoApiClient;
import com.example.backend.dto.request.KakaoLoginRequest;
import com.example.backend.dto.response.TokenResponse;
import com.example.backend.entity.SocialAccount;
import com.example.backend.entity.User;
import com.example.backend.kafka.UserUpdatedPublisher;
import com.example.backend.repository.SocialAccountRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserUpdatedPublisher userUpdatedPublisher;
    private final KakaoApiClient kakaoApiClient;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

    // [카카오 로그인]
    @Transactional
    public TokenResponse kakaoLogin(KakaoLoginRequest request){

        //카카오 서버 통신(토큰 및 유저 정보 획득)
        String kakaoAccessToken = kakaoApiClient.getKakaoAccessToken(request.authorizationCode());//1단계: 토큰 획득
        String kakaoUserId = kakaoApiClient.getKakaoUserId(kakaoAccessToken);

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

            // 모듈들에게 카프카 이벤트 발행
            // - 대상 모듈: post, usersearch
            userUpdatedPublisher.publisherUserUpdated(
                    user.getId(),
                    user.getName(),
                    user.getNickname(),
                    null,
                    user.getStatus()
            );
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

        return TokenResponse.of(user, newAccessToken, newRefreshToken);
    }
}
