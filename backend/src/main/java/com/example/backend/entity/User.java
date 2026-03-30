package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity // 이 클래스가 DB의 테이블임을 선언합니다.
@Table(name = "users") // DB에서 'user'는 예약어인 경우가 많아 'users'로 이름을 지정합니다.
@Getter @Setter // Lombok을 사용하여 Getter/Setter를 자동으로 만듭니다.
public class User {

    @Id // 기본키(Primary Key) 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 번호가 1, 2, 3... 자동으로 증가하게 합니다.
    private Long id;

    @Column(nullable = false, unique = true) // 빈 값 안됨, 중복 안됨
    private String username;

    @Column(nullable = false)
    private String password;

    private String email;

    private String nickname;

    private LocalDateTime createdAt;

    // 데이터가 저장될 때 시간을 자동으로 기록해줍니다.
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}