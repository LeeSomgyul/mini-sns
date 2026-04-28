package com.example.backend.config;

import com.example.backend.config.handler.CustomForbiddenHandler;
import com.example.backend.config.handler.CustomUnauthorizedHandler;
import com.example.backend.security.JwtFilter;
import com.example.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@RequiredArgsConstructor
@Configuration
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUnauthorizedHandler customUnauthorizedHandler;
    private final CustomForbiddenHandler customForbiddenHandler;

    //일반 비밀번호와 해시된 비밀번호 비교 메서드
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    //springSecurity에게 새로운 규칙 주기(너무 깐깐하기 때문)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                //0.아래 corsConfigurationSource() 규칙 적용하기
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                //1.CSRF 보안 끄기(브라우저가 아닌 POST맨, 리엑드 API에서 통신)
                .csrf(AbstractHttpConfigurer::disable)
                //2.JWT토큰으로 사용자 확인할 것이라서 session으로 기억하는거 끄기
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                //3.로그인과 회원가입은 누구나 들어올 수 있음
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/join",
                                "/api/v1/auth/email/send",
                                "/api/v1/auth/email/verify",
                                "/api/v1/auth/reissue",
                                "/api/v1/auth/kakao",
                                "/api/v1/users/nickname/exists"
                            ).permitAll()
                        .anyRequest().authenticated()
                )
                //예외처리
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customUnauthorizedHandler)//401
                        .accessDeniedHandler(customForbiddenHandler)//403
                )
                //JwtFilter.java 필터 검사 다음에 -> 스프링 시큐리티의 기본 로그인 필터 실행
                .addFilterBefore(new JwtFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    //백엔드 8080 포트와 프론트 3000, 5173 포트 통신 가능하도록 환경 만들기
    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));//리엑트(3000)와 비트(5173) 연결
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));//프론트에서 하는 어떤 요청을 허락 할 것인지
        configuration.setAllowedHeaders(List.of("*"));//request 헤더에 담긴 모든 요청을 허용(AccessToken 등)
        configuration.setAllowCredentials(true);//쿠키로 통신하는것 허용

        //위에서 만든 규칙을 모든 경로(url)에 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
