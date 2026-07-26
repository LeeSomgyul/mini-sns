package com.example.backend.repository;

import com.example.backend.entity.Follow;
import com.example.backend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 내가 팔로우하는 사람의 수
    long countByFolloweeId(Long followeeId);

    // 나를 팔로우하는 사람의 수
    long countByFollowerId(Long followerId);

    // 팔로우 여부 확인
    boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    // 내가 팔로우하는 사람들의 id 목록 조회
    @Query("SELECT f.followeeId FROM Follow f WHERE f.followerId = :followerId")
    List<Long> findFolloweeIdsByFollowerId(@Param("followerId") Long followerId);

    // 나를 팔로우하는 사람들의 id 목록 조회
    @Query("SELECT f.followerId FROM Follow f WHERE f.followeeId = :followeeId")
    List<Long> findFollowerIdsByFolloweeId(@Param("followeeId") Long followeeId);

    // Follows 테이블에서 나(follower)와 상대방(followee)의 관계 객체 전달
    Optional<Follow> findByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    // [무한스크롤] 특정 유저가 팔로잉(내가 친구 신청한)하는 유저 목록 조회
    @Query("""
        SELECT f, u
        FROM Follow f JOIN User u ON f.followeeId = u.id
        WHERE f.followerId = :userId AND (:cursor IS NULL OR f.id < :cursor)
        ORDER BY f.id DESC
    """)
    List<Object[]> findFollowingsByUserId(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    // [무한스크롤] 특정 유저를 팔로우(상대방이 나를 신청한)하는 유저 목록 조회
    @Query("""
        SELECT f, u
        FROM Follow f JOIN User u ON f.followerId = u.id
        WHERE f.followeeId = :userId AND (:cursor IS NULL OR f.id < :cursor)
        ORDER BY f.id DESC
    """)
    List<Object[]> findFollowersByUserId(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    // [회원 탈퇴 - 하드삭제]
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM Follow f
        WHERE f.followerId IN :userIds
    """)
    void deleteByFollowerIdIn(@Param("userIds") List<Long> userIds);

    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM Follow f
        WHERE f.followeeId IN :userIds
    """)
    void deleteByFolloweeIdIn(@Param("userIds") List<Long> userIds);
}
