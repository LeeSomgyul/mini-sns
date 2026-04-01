package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.TokenResponse;
import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final LocalAccountRepository localAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request){

        //1.입력 이메일로 local_accounts 테이블에서 계정 찾기
        LocalAccount localAccount = localAccountRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호를 확인해주세요.")); //401(계정 없음)

        //2.입력 비밀번호와 DB의 해싱 비밀번호 비교
        if(!passwordEncoder.matches(request.password(), localAccount.getPasswordHash())){
            throw new IllegalArgumentException("아이디 또는 비밀번호를 확인해주세요."); //401(비밀번호 불일치)
        }

        //3.정상 활동중인 사용자 인지?
        User user = localAccount.getUser();
        if(!"ACTIVE".equals(user.getStatus())){
            throw new IllegalStateException("탈퇴한 사용자입니다.");
        }

        //4.토큰 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getNickname());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        //5.Redis 저장
        redisTemplate.opsForValue().set(
                "refresh:" + user.getId(),//키(이름표)
                refreshToken,//값(실제 토큰)
                Duration.ofDays(7)//7일 보관
        );

        //6.결과 반환(TokenResponse 바구니에 담에서 Controller로 전달)
        return new TokenResponse(
                user.getId(),
                user.getNickname(),
                accessToken,
                refreshToken
        );
        /*
        return TokenResponse.builder()
            .userId(user.getId())
            .nickname(user.getNickname())
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .build();
        */
    }
}
