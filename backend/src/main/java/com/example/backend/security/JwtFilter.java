package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    //doFilterInternal 메서드: 모든 요청마다 있어야 보안 로직(즉, 토큰 검사에 사용된다)
    @Override
    protected void doFilterInternal(
        //request: 신분증(토큰) 검증 원하는 요청
        //response: 검사 결과(실제 존재하는 사용자? 권한 없는 사용자?)
        //filterChain: 다음 진행 단계(Controller 등..)
        HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException{

        //토큰의 헤더키에 해당하는 Authorization 꺼내기 (key = Authorization, value = accessToken값)
        String authHeader = request.getHeader("Authorization");
        String token = null;

        //토큰이 있고 && 'Bearer '로 시작하면 -> 진짜 토큰 부분만 잘라내서 위 변수에 저장
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            token = authHeader.substring(7);
        }

        //토큰이 있고 && 정상 토큰이라면
        if(token != null && jwtTokenProvider.validateToken(token)){
            Authentication authentication = jwtTokenProvider.getAuthentication(token);//검증 완료된 JWT에 대한 신분증
            SecurityContextHolder.getContext().setAuthentication(authentication);//스프링 시큐리티에 검증된 유저들 저장
        }

        //doFilter 메서드: 다음 필터 단계로 넘겨주는 메서드
        //필터 순서: SecurityConfig.java의 filterChain 대로)
        filterChain.doFilter(request, response);
    }

}
