package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Table(name = "user_cache")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserCache {

    @Id
    @Column(name = "usre_id", nullable = false)
    private Long userId;

    @Column(name = "nickname", nullable = false, length = 20)
    private String nickname;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
}
