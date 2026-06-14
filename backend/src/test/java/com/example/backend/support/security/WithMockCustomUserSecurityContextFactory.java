package com.example.backend.support.security;

import com.example.backend.common.security.CustomUserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Collections;

public class WithMockCustomUserSecurityContextFactory implements WithSecurityContextFactory<WithMockCustomUser> {
    @Override
    public SecurityContext createSecurityContext(WithMockCustomUser annotation) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        // @WithMockCustomUser로 사용할 수 있는 CustomUserDetails 객체 조립
        CustomUserDetails customUserDetails = new CustomUserDetails(
                annotation.userId(),
                annotation.email(),
                "password123!",
                Collections.singletonList(() -> "ROLE_USER")
        );

        // Spring Security의 공식 구격인 UsernamePasswordAuthenticationToken에 조립
        Authentication auth = new UsernamePasswordAuthenticationToken(
                customUserDetails, //로그인을 위해 customUserDetails 사용
                null, //로그인 완료 이후 비밀번호 데이터를 메모리에서 제거
                customUserDetails.getAuthorities() //사용자에게 부여한 권한 "ROLE_USER" 가져오기
        );

        context.setAuthentication(auth);

        return context;
    }
}
