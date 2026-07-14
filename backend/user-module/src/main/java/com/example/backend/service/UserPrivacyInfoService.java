package com.example.backend.service;

import com.example.backend.dto.request.UserPrivacyInfoUpdateRequest;
import com.example.backend.dto.response.UserPrivacyInfoResponse;
import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.kafka.UserUpdatedPublisher;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.repository.SocialAccountRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserPrivacyInfoService {

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;

    private final UserRepository userRepository;
    private final LocalAccountRepository localAccountRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;
    private final UserUpdatedPublisher userUpdatedPublisher;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

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
    public void updateUserPrivacyInfo(Long userId, UserPrivacyInfoUpdateRequest request){
        // 1. 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("시간이 만료되어 다시 로그인해주세요."));

        // 2. 사용자 활동 여부 확인 (정상, 탈퇴)
        if(!"ACTIVE".equals(user.getStatus())){
            throw new InvalidRequestException("탈퇴하거나 존재하지 않는 사용자입니다.");
        }

        // 3. 닉네임 변경 중복 재점검
        if(StringUtils.hasText(request.nickname())){
            String newNickname = request.nickname().trim();

            if(!newNickname.equals(user.getNickname())){
                Optional<User> existingUser = userRepository.findByNickname(newNickname);

                if(existingUser.isPresent()){
                    throw new InvalidRequestException("이미 사용 중인 닉네임입니다.");
                }

                user.updateNickname(newNickname);
            }
        }else{
            throw new InvalidRequestException("닉네임은 공백일 수 없습니다.");
        }

        // 4. 전화번호 변경
        if(StringUtils.hasText(request.phoneNumber())){
            user.updatePhoneNumber(request.phoneNumber().trim());
        }else{
            throw new InvalidRequestException("전화번호는 공백일 수 없습니다.");
        }

        // 5. 프로필 이미지 url 변경 (프론트 uppy에서 넘어온 최종 object key)
        if(StringUtils.hasText(request.profileImageUrl())){
            user.updateProfileImageUrl(request.profileImageUrl().trim());
        }

        // 6. 비밀번호 변경 검증 (비밀번호 변경 토글이 열리면 실행)
        if(Boolean.TRUE.equals(request.isPasswordChanging())){
            boolean isSocial = socialAccountRepository.existsById(userId);

            if(isSocial){
                throw new InvalidRequestException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
            }

            LocalAccount localAccount = localAccountRepository.findByUserId(userId)
                    .orElseThrow(() -> new InvalidRequestException("계정 정보를 찾을 수 없습니다."));

            if (!StringUtils.hasText(request.currentPassword()) || !StringUtils.hasText(request.newPassword())) {
                throw new InvalidRequestException("현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.");
            }

            if (!passwordEncoder.matches(request.currentPassword(), localAccount.getPasswordHash())) {
                throw new InvalidRequestException("현재 비밀번호가 일치하지 않습니다.");
            }

            if (passwordEncoder.matches(request.newPassword(), localAccount.getPasswordHash())) {
                throw new InvalidRequestException("새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.");
            }

            String encodedPassword = passwordEncoder.encode(request.newPassword().trim());
            localAccount.updatePassword(encodedPassword);

            // 비밀번호 변경 후 레디스에서 로그인한 사용자 세션 모두 만료
            String refreshTokenKey = REFRESH_TOKEN_PREFIX + userId;
            if(stringRedisTemplate.opsForValue().get(refreshTokenKey) != null){
                stringRedisTemplate.delete(refreshTokenKey);
            }

            // 비밀번호 변경 후 보안으로 기기 토큰도 null로 변경
            user.updateDeviceToken(null);
        }

        // 모듈들에게 카프카 이벤트 발행
        // - 대상 모듈: post, usersearch
        userUpdatedPublisher.publisherUserUpdated(
                user.getId(),
                user.getName(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getStatus()
        );
    }
}
