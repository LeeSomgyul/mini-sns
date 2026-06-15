package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    //[닉네임 중복 확인]
    boolean existsByNickname(String nickname);

    //[닉네임으로 사용자(User 객체) 찾기]
    Optional<User> findByNickname(String nickname);

    //[feed 기능: Pull 대상 조회]
    List<User> findByIsCelebrityTrue();

    //[글쓴이(actorId)를 제외한 현재 서비스의 모든 유저ID 리스트 가져오기
    @Query("SELECT u.id FROM User u WHERE u.id != :actorId")
    List<Long> findAllIdsExcept(@Param("actorId") Long actorId);
}
