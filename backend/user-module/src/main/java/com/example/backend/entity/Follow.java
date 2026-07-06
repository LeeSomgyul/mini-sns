package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(
        name = "follows",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"follower_id", "followee_id"})
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Follow {

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
    public Follow(Long followerId, Long followeeId){
        this.followerId = followerId;
        this.followeeId = followeeId;
    }
}
