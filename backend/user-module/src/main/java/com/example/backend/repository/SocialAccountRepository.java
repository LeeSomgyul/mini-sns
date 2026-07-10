package com.example.backend.repository;

import com.example.backend.entity.SocialAccount;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {
    Optional<SocialAccount> findByProviderUserId(String providerUserId);

    // [소셜 계정 존재 여부 확인]
    boolean existsByUser(User user);
}
