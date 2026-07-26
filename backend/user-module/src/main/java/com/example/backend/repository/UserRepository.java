package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    //[여러 userId로 User 가져오기]
    List<User> findByIdIn(List<Long> userIds);

    // [회원 탈퇴 - 하드삭제]
    // 1. 30일 지난 유저의 id를 Slice 단위로 조회
    @Query("""
        SELECT u.id
        FROM User u
        WHERE u.status = :status AND u.withdrawnAt <= :withdrawnAt
        ORDER BY u.id ASC
    """)
    Slice<Long> findExpiredWithdrawnUserIds(
            @Param("status") String status,
            @Param("withdrawnAt")LocalDateTime withdrawnAt,
            Pageable pageable
    );

    // 2. 추출된 유저의 id 목록에 해당하는 User 데이터 전체 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM User u
        WHERE u.id IN :userIds
    """)
    void deleteByIdIn(@Param("userIds") List<Long> userIds);
}
