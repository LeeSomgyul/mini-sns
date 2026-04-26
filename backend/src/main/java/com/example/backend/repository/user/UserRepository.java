package com.example.backend.repository.user;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

//JPA의 기본 기능 + 나의 custom기능 합치기
public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {
    boolean existsByNickname(String nickname);//닉네임 중복 확인
    Optional<User> findByNickname(String nickname);//닉네임으로 사용자(User 객체) 찾기
}
