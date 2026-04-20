package com.example.backend.security;

import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

//헤더로 사용자의 정보를 보내줌 (사용자가 어떤 작업을 시도할 때마다 실존하는 사용자가 맞는지 확인)
@Builder
public record CustomUserDetails (
        Long userId,
        String email,
        String password,
        Collection<? extends GrantedAuthority> authorities
)implements UserDetails {
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
