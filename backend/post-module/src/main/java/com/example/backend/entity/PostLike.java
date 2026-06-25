package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Getter
@Table(
        name = "post_like",
        uniqueConstraints = {
                // 사용자는 한 게시물에 대해 중복 좋아요 불가능
                @UniqueConstraint(name = "uk_post_user", columnNames = {"post_id", "user_id"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "created_At", nullable = false, updatable = false)
    private Instant createdAt;

    private PostLike(Post post, Long userId){
        this.post = post;
        this.userId = userId;
        this.createdAt = Instant.now();
    }

    public static PostLike of(Post post, Long userId){
        return new PostLike(post, userId);
    }
}
