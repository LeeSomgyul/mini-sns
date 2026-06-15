//package com.example.backend.common.security;
//
//import com.example.backend.common.security.handler.CustomForbiddenHandler;
//import com.example.backend.common.security.handler.CustomUnauthorizedHandler;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
////[역할] 종합 보안 설정
//@RequiredArgsConstructor
//@Configuration
//public class SecurityConfig {
//
//    private final JwtTokenProvider jwtTokenProvider;
//    private final CustomUnauthorizedHandler customUnauthorizedHandler;
//    private final CustomForbiddenHandler customForbiddenHandler;
//
//    //일반 비밀번호와 해시된 비밀번호 비교 메서드
//    @Bean
//    public PasswordEncoder passwordEncoder(){
//        return new BCryptPasswordEncoder();
//    }
//
//    //springSecurity에게 새로운 규칙 주기(너무 깐깐하기 때문)
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
//        http
//                //1.CSRF 보안 끄기(브라우저가 아닌 POST맨, 리엑드 API에서 통신)
//                .csrf(AbstractHttpConfigurer::disable)
//                //2.JWT토큰으로 사용자 확인할 것이라서 session으로 기억하는거 끄기
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//                //3.로그인과 회원가입은 누구나 들어올 수 있음
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(
//                                "/v1/auth/login",
//                                "/v1/auth/join",
//                                "/v1/auth/email/send",
//                                "/v1/auth/email/verify",
//                                "/v1/auth/reissue",
//                                "/v1/auth/kakao",
//                                "/v1/users/nickname/exists"
//                            ).permitAll()
//                        .anyRequest().authenticated()
//                )
//                //4.handler 예외처리
//                .exceptionHandling(exception -> exception
//                        .authenticationEntryPoint(customUnauthorizedHandler)//401
//                        .accessDeniedHandler(customForbiddenHandler)//403
//                )
//                //JwtFilter.java 필터 검사 다음에 -> 스프링 시큐리티의 기본 로그인 필터 실행
//                .addFilterBefore(new JwtFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
//        return http.build();
//    }
//}
