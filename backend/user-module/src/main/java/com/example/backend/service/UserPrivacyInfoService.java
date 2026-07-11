package com.example.backend.service;

import com.example.backend.dto.request.UserPrivacyInfoUpdateRequest;
import com.example.backend.dto.response.UserPrivacyInfoResponse;
import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.repository.SocialAccountRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserPrivacyInfoService {

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;

    private final UserRepository userRepository;
    private final LocalAccountRepository localAccountRepository;
    private final SocialAccountRepository socialAccountRepository;

    // [프로필 개인정보 리스트 조회]
    // @param userId: 현재 로그인한 사용자 본인 id
    @Transactional(readOnly = true)
    public UserPrivacyInfoResponse getUserPrivacyInfo(Long userId){
        // 1. [검증] 사용자 정보 조회
        User user = userRepository.findById(userId)
                .filter(u -> "ACTIVE".equals(u.getStatus()))
                .orElseThrow(() -> new NotFoundException("존재하지 않거나 탈퇴한 사용자입니다."));

        // 2. 소셜 가입 여부 확인
        boolean isSocial = socialAccountRepository.existsByUser(user);

        // 3. 이메일 가져오기
        String email = null;
        if(!isSocial){
            email = localAccountRepository.findByUser(user)
                    .map(LocalAccount::getEmail)
                    .orElse("이메일 정보가 없습니다.");
        }else{
            email = "소셜 연동 계정";
        }

        // 4. minio 프로필 이미지 조립
        String baseStorageUrl = minioEndpoint + "/" + minioBucket + "/";
        String fullStorageUrl = null;

        if(user.getProfileImageUrl() != null){
            fullStorageUrl = baseStorageUrl + user.getProfileImageUrl();
        }

        return UserPrivacyInfoResponse.of(
                user.getName(),
                user.getNickname(),
                user.getPhoneNumber(),
                fullStorageUrl,
                email,
                isSocial
        );
    }

    // [프로필 개인정보 수정]
    @Transactional
    public Void updateUserPrivacyInfo(Long userId, UserPrivacyInfoUpdateRequest request){
        // 1. 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("시간이 만료되어 다시 로그인해주세요."));

        // 2. 사용자 활동 여부 확인 (정상, 탈퇴)
        if(!"ACTIVE".equals(user.getStatus())){
            throw new InvalidRequestException("탈퇴하거나 존재하지 않는 사용자입니다.");
        }
    }
}
