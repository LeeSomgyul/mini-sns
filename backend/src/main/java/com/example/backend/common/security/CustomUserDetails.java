package com.example.backend.common.security;

import com.example.backend.domain.user.entity.LocalAccount;
import com.example.backend.domain.user.entity.User;
import lombok.Builder;
import lombok.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

//[역할] 헤더로 현재 로그인한 사용자의 정보를 보내줌
// - 사용자가 어떤 작업을 시도할 때마다 실존하는 사용자가 맞는지 확인)
@Builder
public record CustomUserDetails (
        Long userId,
        String email,
        String password,
        Collection<? extends GrantedAuthority> authorities
)implements UserDetails {

    public static CustomUserDetails of(User user, LocalAccount localAccount){
        return new CustomUserDetails(
            user.getId(),
            localAccount.getEmail(),
            localAccount.getPasswordHash(),
            Collections.emptyList()
        );
    }

    @Override
    @NonNull
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    @NonNull
    public String getUsername() {
        return email;
    }
}
