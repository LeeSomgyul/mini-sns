package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "users", indexes = {
        @Index(name = "idx_users_name", columnList = "name"),
        @Index(name = "idx_users_created_at", columnList = "created_at")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String nickname;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "device_token", columnDefinition = "TEXT")
    private String deviceToken;

    @Column(name = "is_celebrity", nullable = false)
    private boolean isCelebrity = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    //초기 객체 생성 빌더
    @Builder
    public User(String name, String nickname, String phoneNumber, String profileImageUrl, String deviceToken){
        this.name = name;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
        this.status = "ACTIVE";
        this.deviceToken = deviceToken;
    }

    // deviceToken 갱신을 위한 메서드(기기마다 token이 다르니까)
    public void updateDeviceToken(String deviceToken){
        this.deviceToken = deviceToken;
    }

    // lastLoginAt(마지막 로그인 시간)를 업데이트하는 메서드
    public void updateLastLoginAt(){
        this.lastLoginAt = LocalDateTime.now();
    }

    // 닉네임 변경
    public void updateNickname(String nickname){
        if(nickname == null || nickname.trim().isEmpty()){
            throw new IllegalArgumentException("닉네임은 공백일 수 없습니다.");
        }

        this.nickname = nickname;
    }

    // 전화번호 변경
    public void updatePhoneNumber(String phoneNumber){
        if(phoneNumber == null || phoneNumber.trim().isEmpty()){
            throw new IllegalArgumentException("전화번호는 공백일 수 없습니다.");
        }

        this.phoneNumber = phoneNumber;
    }

    // 프로필 이미지 변경
    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    // 일반 -> 인플루언서 변경
    public void changeCelebrityStatus(boolean isCelebrity){
        this.isCelebrity = isCelebrity;
    }
}
