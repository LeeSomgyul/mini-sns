package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;

// [user모듈의 팔로우 & 언팔로우 시 관계에 대한 데이터 가져와서 저장]
@Entity
@Table(
        name = "user_follow_cache",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_follower_following",
                        columnNames = {"follower_id", "followee_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_follower_id",
                        columnList = "follower_id"
                )
        }
)
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserFollowCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "follower_id", nullable = false)
    private Long followerId; // 팔로우 하는 사람 (나)

    @Column(name = "followee_id", nullable = false)
    private Long followeeId; // 팔로우 받는 사람 (상대방)

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;


    @Builder
    public UserFollowCache(Long followerId, Long followeeId, Instant createdAt){
        this.followerId = followerId;
        this.followeeId = followeeId;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }
}
