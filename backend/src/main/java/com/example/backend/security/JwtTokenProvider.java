package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    //비밀키 저장
    private final SecretKey key;

    //키 만료 시간
    private final long accessTokenValidity = 1000L * 60 *30; //30분
    private final long refreshTokenValidity = 1000L * 60 * 60 * 24 * 7; //7일

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey){
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    //AccessToken 생성
    public String createAccessToken(Long userId, String nickname){
        Date now = new Date();//토큰 생성 시간
        Date validity = new Date(now.getTime() + accessTokenValidity);//토큰 만료 시간

        //토큰 생성
        return Jwts.builder()
                .subject(String.valueOf(userId))//토큰 주인
                .claim("nickname", nickname)//추가 전달 데이터(선택)
                .issuedAt(now)//토큰 생성 시간
                .expiration(validity)//토큰 만료 시간
                .signWith(key)//비밀키
                .compact();
    }

    //RefreshToken 생성
    public String createRefreshToken(Long userId){
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidity);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    //사용자가 가져온 JWT토큰에서 -> userId 꺼낸 뒤 -> 우리 시스템의 신분증(Authentication)으로 재발급
    public Authentication getAuthentication(String token){
        Claims claims = Jwts.parser()//JWT를 여는 도구
                .verifyWith(key)//key로 잠금 해제
                .build()
                .parseSignedClaims(token)//전달받은 토큰이 진짜인지 확인
                .getPayload();//맞다면 안에 내용물 꺼내기

        String userIdStr = claims.getSubject();//토큰에 저장했었던 userId 추출
        Long userId = Long.parseLong(userIdStr);

        //@AuthenticationPrincipal 를 사용하는 곳에 사용자의 정보 넣기(신분증)
        //로그아웃 할 때 실행 (공백 데이터인 이유는, 이미 로그인할 때 CustomerUserDetailsService.java에서 검증함)
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .userId(userId)
                .email("")
                .password("")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();


        //스프링 시큐리티 전용 신분증 양식에 userId와 유저의 권한을 담아서 전송
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    //토큰이 가짜인지, 만료되었는지 검증
    public boolean validateToken(String token){
        try{
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);//토큰 해석(parse)하여 진짜인지 여부 판단
            return true;
        }catch(Exception e){
            return false;
        }
    }

    //토근에서 userId 가져오기
    public Long getUserIdFromToken(String token){
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.valueOf(claims.getSubject());
    }

    //accessToken 남은 시간 계산 (로그아웃에서 사용)
    public Long getExpiratiom(String accessToken) {
        try{
            //토큰에서 만료일 추출
            Date expiration = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(accessToken)
                    .getPayload()
                    .getExpiration();

            //현재 시간 가져오기
            long nowTime = System.currentTimeMillis();

            //남은 시간 계산
            long remainingTime = expiration.getTime() - nowTime;

            //음수 방지 처리
            return Math.max(remainingTime, 0);
        }catch(Exception e){
            return 0L;
        }
    }
}
