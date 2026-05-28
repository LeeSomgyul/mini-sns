package com.example.backend.domain.auth.service;

import com.example.backend.domain.user.entity.LocalAccount;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.auth.repository.LocalAccountRepository;
import com.example.backend.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

//[역할] 사용자가 로그인 최초로 실행할 때 실행 (저장된 사용자의 정보들을 가져옴)
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final LocalAccountRepository localAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        //DB에서 이메일로 진짜 우리 회원인지 찾기
        LocalAccount localAccount = localAccountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("가입되지 않은 이메일입니다: " + email));

        //위 정보로 User객체 가져오기
        User user = localAccount.getUser();

        return CustomUserDetails.of(user, localAccount);
    }
}
