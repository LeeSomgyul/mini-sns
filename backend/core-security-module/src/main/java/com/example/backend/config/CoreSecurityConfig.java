package com.example.backend.config;

import com.example.backend.handler.CustomForbiddenHandler;
import com.example.backend.handler.CustomUnauthorizedHandler;
import com.example.backend.jwt.JwtFilter;
import com.example.backend.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

//[역할] 종합 보안 설정 뼈대
// - 내부 자세한 값은 각 자식 모듈의 application.yml에서 끌어와서 적용한다.
@RequiredArgsConstructor
@Configuration
public class CoreSecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUnauthorizedHandler customUnauthorizedHandler;
    private final CustomForbiddenHandler customForbiddenHandler;

    // 자식 모듈의 application.yml에서 허용 목록을 읽어온다.
    @Value("${api.security.permit-urls:}")
    private String[] permitUrls;

    //일반 비밀번호와 해시된 비밀번호 비교 메서드
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // 서버에 들어오는 모든 API 호출이 통과해야 하는 순서
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                // 1.CSRF 끄기 (브라우저 쿠키 탈취 공격 방어)
                // - 현재 프로젝트는 쿠키가 아닌 JWT 토큰으로 인증 여부를 확인하기 때문에 필요 없음
                .csrf(AbstractHttpConfigurer::disable)

                // 2.세션 생성 끄기
                // - 스프링 시큐리티가 내부적으로 유저 정보를 기억하기 위해 세션을 만드는 것을 차단.
                // - 이유: 현재는 서버 메모리에 세션을 쌓아두고 유저를 기억하는 방식이 아니라,
                //        요청이 들어올 때마다 JWT 토큰 하나만 검사해서 인증하는 방식이기 때문.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 3.URL 주소별로 어떤 주소를 입장 허용해 줄지 판단
                .authorizeHttpRequests(auth -> auth
                        // 각 모듈의 application.yml에 적어둔 경로는 아무 조건 없이 허용
                        .requestMatchers(permitUrls).permitAll()
                        // 그 외는 로그인(인증) 통해서 확인 후 허용
                        .anyRequest().authenticated()
                )

                // 4.API가 통과하다가 예외가 터졌을 경우 처리
                .exceptionHandling(exception -> exception
                        // 401 UNAUTHORIZED 토큰이 없거나 유효하지 않아서 인증을 통과하지 못하는 경우
                        .authenticationEntryPoint(customUnauthorizedHandler)
                        // 403 Forbidden 로그인은 했지만 접근 불가능한 api에 갔을 경우
                        .accessDeniedHandler(customForbiddenHandler)
                )
                // 5. Jwt 토큰 유효 검사
                .addFilterBefore(new JwtFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
