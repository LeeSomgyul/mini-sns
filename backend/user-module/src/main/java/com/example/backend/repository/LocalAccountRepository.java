package com.example.backend.repository;

import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocalAccountRepository extends JpaRepository<LocalAccount, Long> {

    // [이메일 찾아서 출력]
    Optional<LocalAccount> findByEmail(String email);//이메일로 사용자 찾기

    // [이메일 존재 여부 확인]
    boolean existsByEmail(String email);//이메일 중복 확인

    // [사용자 조회]
    Optional<LocalAccount> findByUser(User user);
    Optional<LocalAccount> findByUserId(Long userId);
}
