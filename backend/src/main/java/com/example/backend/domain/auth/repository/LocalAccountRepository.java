package com.example.backend.domain.auth.repository;

import com.example.backend.domain.user.entity.LocalAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocalAccountRepository extends JpaRepository<LocalAccount, Long> {

    Optional<LocalAccount> findByEmail(String email);//이메일로 사용자 찾기
    boolean existsByEmail(String email);//이메일 중복 확인
}
