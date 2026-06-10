package com.example.backend.support.security;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

//[CustomUserDetails 대신 로그인한 유저 생성]
// @interface: 커스텀 애노테이션 만들때 사용 (@WithMockCustomUser 제작)
// @Retention: @WithMockCustomUser를 사용하면 test가 실행되는 내내 유지
// @WithSecurityContext: @WithMockCustomUser 내부의 userId, email을 가지고 factory로 이동
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockCustomUserSecurityContextFactory.class)
public @interface WithMockCustomUser {
    long userId() default 1L;
    String email() default "test1@example.com";
}
