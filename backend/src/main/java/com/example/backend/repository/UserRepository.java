package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    //[닉네임 중복 확인]
    boolean existsByNickname(String nickname);

    //[닉네임으로 사용자(User 객체) 찾기]
    Optional<User> findByNickname(String nickname);

    //[feed 기능: Pull 대상 조회]
    List<User> findByIsCelebrityTrue();
}
