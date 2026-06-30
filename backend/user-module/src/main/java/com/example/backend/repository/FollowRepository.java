package com.example.backend.repository;

import com.example.backend.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 내가 팔로우하는 사람의 수
    long countByFolloweeId(Long followeeId);

    // 나를 팔로우하는 사람의 수
    long countByFollowerId(Long followerId);

    // 팔로우 여부 확인
    boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    // 내가 팔로우하는 사람들의 id 목록 조회
    List<Long> findFolloweeIdsByFollowerId(Long followerId);

    // 나를 팔로우하는 사람들의 id 목록 조회
    List<Long> findFollowerIdsByFollowerId(Long followeeId);
}
