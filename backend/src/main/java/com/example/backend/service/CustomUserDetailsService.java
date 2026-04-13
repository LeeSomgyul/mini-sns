package com.example.backend.service;

import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final LocalAccountRepository localAccountRepository;

    //사용자가 로그인 최초로 실행할 때 실행 (저장된 사용자의 정보들을 가져옴)
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        //DB에서 이메일로 진짜 우리 회원인지 찾기
        LocalAccount localAccount = localAccountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("가입되지 않은 이메일입니다: " + email));

        //위 정보로 User객체 가져오기
        User user = localAccount.getUser();

        return CustomUserDetails.builder()
                .userId(user.getId())
                .email(localAccount.getEmail())
                .password(localAccount.getPasswordHash())
                .authorities(Collections.emptyList())
                .build();
    }
}
