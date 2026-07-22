package com.example.backend.entity;

import com.example.backend.exception.InvalidRequestException;
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


    // ================================[메서드]================================
    // [회원탈퇴] 유저 소프트 삭제
    public void userSoftDelete(){
        if("WITHDRAWN".equals(this.status)){
            throw new InvalidRequestException("UserCache에 사용자가 존재하지 않습니다.");
        }

        this.status = "WITHDRAWN";
    }
}
