package com.example.backend.domain.auth.repository;

import com.example.backend.domain.user.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {
    Optional<SocialAccount> findByProviderUserId(String providerUserId);
}
