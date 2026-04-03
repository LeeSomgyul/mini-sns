package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByNickname(String nickname);//닉네임 중복 확인
    Optional<User> findByNickname(String nickname);//닉네임으로 사용자(User 객체) 찾기
}
