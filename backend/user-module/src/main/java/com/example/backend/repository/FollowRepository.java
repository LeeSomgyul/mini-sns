package com.example.backend.repository;

import com.example.backend.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
