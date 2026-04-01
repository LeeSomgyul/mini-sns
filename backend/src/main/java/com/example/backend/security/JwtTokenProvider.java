package com.example.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

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

    //1. AccessToken 생성
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

    //2. RefreshToken 생성
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
}
