package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "local_accounts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class LocalAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @LastModifiedDate
    @Column(name = "password_changed_at", nullable = false)
    private LocalDateTime passwordChangedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    //초기 객체 생성 빌더
    @Builder
    public LocalAccount(User user, String email, String passwordHash){
        this.user = user;
        this.email = email;
        this.passwordHash = passwordHash;
        this.passwordChangedAt = LocalDateTime.now();
    }

    //비밀번호 변경에 사용할 메서드
    public void updatePassword(String newPasswordHash){
        this.passwordHash = newPasswordHash;
        this.passwordChangedAt = LocalDateTime.now();
    }
}
