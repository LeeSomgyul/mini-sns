package com.example.backend.repository;

import com.example.backend.entity.UserCache;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserCacheRepository extends JpaRepository<UserCache, Long> {

    // 글쓴이(authorId)를 제외한 모든 캐시된 유저의 id만 리스트로 추출
    @Query("""
        SELECT u.id\s
        FROM UserCache u\s
        WHERE u.id != :actorId
        """)
    List<Long> findAllIdsExcept(@Param("actorId")Long actorId);

    Optional<UserCache> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    // [회원탈퇴 - 하드 삭제]
    // 1. 소프트 삭제 30이링 경과된 탈퇴자 slice 목록 조회
    @Query("""
        SELECT uc.userId
        FROM UserCache uc
        WHERE uc.status = :status
            AND uc.withdrawnAt <= :withdrawnAt
        ORDER BY uc.userId ASC
    """)
    Slice<Long> findExpiredWithdrawnUserIds(
            @Param("status") String status,
            @Param("withdrawnAt")Instant withdrawnAt,
            Pageable pageable
    );

    // 2. UserCache DB에서 유저 리스트 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM UserCache u
        WHERE u.userId IN :userIds
    """)
    void deleteByIdIn(@Param("userIds") List<Long> userIds);
}
