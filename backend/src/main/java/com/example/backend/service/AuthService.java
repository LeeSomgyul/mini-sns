package com.example.backend.service;

import com.example.backend.dto.JoinRequest;
import com.example.backend.dto.JoinResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.TokenResponse;
import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REDIS_TOKEN_PREFIX = "email:verify:token:";//인증 완료 토큰 저장 헤더
    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

    //로그인
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
                REFRESH_TOKEN_PREFIX + user.getId(),//키(이름표)
                refreshToken,//값(실제 토큰)
                Duration.ofDays(7)//7일 보관
        );

        //6.결과 반환(TokenResponse 바구니에 담에서 Controller로 전달)
        return TokenResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    //회원가입
    @Transactional
    public JoinResponse join(JoinRequest request){

        //1.이메일 중복 검증
        if(localAccountRepository.existsByEmail(request.email())){
            throw new DuplicateResourceException("이미 가입된 이메일입니다.");
        }

        //2.닉네임 중복 검증
        if(userRepository.existsByNickname(request.nickname())){
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
        }

        //3.이메일 인증번호 검증(Redis 저장)
        String redisKey = REDIS_TOKEN_PREFIX + request.email();
        String savedValue = redisTemplate.opsForValue().get(redisKey);//인증 뒤 받은 토큰

        //4.인증번호가 존재하지 않거나, 저장된 값과 사용자의 값이 다른 경우
        if(savedValue == null || !savedValue.equals(request.verificationToken())){
            throw new IllegalArgumentException("이메일 인증을 다시 진행해주세요.");
        }

        //5.이름이 공백이라면 '익명' 처리
        String finalName = (request.name() == null || request.name().trim().isEmpty())
                ? "익명" : request.name().trim();

        //6.사용자의 기본정보 User에 저장
        User user = User.builder()
                .name(finalName)
                .nickname(request.nickname().trim())
                .phoneNumber(request.phoneNumber())
                .build();
        userRepository.save(user);//DB 저장

        //7.사용자의 비밀번호 정보 LocalAccount에 저장
        LocalAccount localAccount = LocalAccount.builder()
                .user(user)
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        localAccountRepository.save(localAccount);//DB 저장

        //8.사용 완료한 인증번호 Redis에서 삭제
        redisTemplate.delete(redisKey);

        //9.JoinResponse 응답
        return JoinResponse.builder()
                .status("success")
                .message("회원가입이 완료되었습니다.")
                .data(JoinResponse.Data.builder()
                        .userId(user.getId())
                        .email(localAccount.getEmail())
                        .nickname(user.getNickname())
                        .build())
                .build();
    }

    //페이지 이동 or 새로고침 시 AccessToken, RefreshToken 재발급
    @Transactional
    public TokenResponse tokenReissue(String refreshToken){

        //refreshToken 만료, 위조 검증
        if(!jwtTokenProvider.validateToken(refreshToken)){
            throw new InvalidTokenException("유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        //Redis에 저장되어있는 토큰과 비교
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        String redisRefreshToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + userId);
        if(redisRefreshToken == null || !redisRefreshToken.equals(refreshToken)){
            throw new InvalidTokenException("일치하지 않는 리프레시 토큰입니다.");
        }

        //새 토큰 발급(accessToken, refreshToken 모두)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("사용자가 존재하지 않습니다."));

        String nickname = user.getNickname();
        String newAccessToken = jwtTokenProvider.createAccessToken(userId, nickname);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId);

        //Redis에 있는 토큰 만료기간 업데이트
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + userId,
                newRefreshToken,
                Duration.ofDays(7)
        );

        return TokenResponse.builder()
                .userId(userId)
                .nickname(nickname)
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}
