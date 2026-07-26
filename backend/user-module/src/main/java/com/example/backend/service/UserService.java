package com.example.backend.service;

import com.example.backend.dto.response.NicknameCheckResponse;
import com.example.backend.dto.response.TagUserProfileResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.FollowRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final TransactionTemplate transactionTemplate; //@Transactional 내부에 또 @Transactional 가능

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;

    // [닉네임 중복 확인]
    @Transactional(readOnly = true)
    public NicknameCheckResponse checkNicknameDuplicate(String nickname, Long currentUserId){

        //1.닉네임으로 유저 객체 조회
        Optional<User> existingUser = userRepository.findByNickname(nickname);

        boolean exists = false;//닉네임 존재 여부 저장(사용가능 false)

        //2.이미 존재하는 닉네임인 경우
        if(existingUser.isPresent()) {
            //현재 로그인한 유저 본인의 닉네임인 경우 -> 사용 가능
            if (currentUserId != null && existingUser.get().getId().equals(currentUserId)) {
                exists = false;
            } else {
                //타인이 사용중인 경우 -> 사용 불가
                exists = true;
            }
        }

        String message = exists ? "이미 사용 중인 닉네임입니다." : "사용 가능한 닉네임입니다.";

        //3.결과 반환
        return NicknameCheckResponse.from(exists);
    }

    // [게시물 수정] 기존 태그된 사용자의 정보 불러오기
    public List<TagUserProfileResponse> getTagUserProfile(List<Long> userIds){
        // 결과: http://localhost:9000/mini-sns/
        String minioBaseUrl = minioEndpoint + "/" + minioBucket + "/";

        // 방어: 요청된 userId가 없으면 빈 리스트 반환하여 DB 낭비 막기
        if(userIds == null || userIds.isEmpty()){
            return Collections.emptyList();
        }

        // 유저 정보 일괄 조회
        List<User> users = userRepository.findByIdIn(userIds);

        return users.stream()
                .map(user -> TagUserProfileResponse.from(user, minioBaseUrl))
                .toList();
    }

    // [회원 탈퇴 - 하드 삭제]
    // - 설명: 회원탈퇴(소프트 삭제) 기간이 30일이 지난 유저 테이터를 100건씩 조회하여 삭제
    // - 흐름: 30일 경과 -> 스케줄러 호출 -> Slice로 유저 id 100개 추출 -> 조회 결과가 있다면 follow 테이블 먼저 삭제
    // -> users 테이블 삭제 -> CASCADE로 local/social 테이블 데이터도 삭제 -> 다음 삭제 데이터 있다면 반복
    @Transactional
    public void userHardDelete(LocalDateTime withdrawnAt){
        log.info("[회원 탈퇴 - 하드 삭제 실행] 스케줄러 청소 시작 (기준 시점: {})", withdrawnAt);

        // [변수] 삭제 성공한 총 유저 수
        int totalDeletedCount = 0;

        while(true){
            // 1. 삭제 대상 100건 단위로 조회
            Slice<Long> hardDeleteTargetsSlice = userRepository.findExpiredWithdrawnUserIds(
                    "WITHDRAWN",
                    withdrawnAt,
                    PageRequest.of(0, 100)
            );

            List<Long> hardDeleteTargets = hardDeleteTargetsSlice.getContent();
            log.info("[User 하드삭제 배치] Slice 조회 결과 - 발견된 대상 수: {}건, ID 목록: {}",
                    hardDeleteTargets.size(), hardDeleteTargets);


            // 더 이상 지울 대상이 없다면 반복문 종료
            if(hardDeleteTargets.isEmpty()){
                break;
            }

            // 2. DB의 데이터 삭제 시작 (Users, LocalAccount, SocialAccount, Follow)
            transactionTemplate.executeWithoutResult(status -> {
                followRepository.deleteByFollowerIdIn(hardDeleteTargets);
                followRepository.deleteByFolloweeIdIn(hardDeleteTargets);
                userRepository.deleteByIdIn(hardDeleteTargets);
            });

            totalDeletedCount += hardDeleteTargets.size();
            log.info("[회원 탈퇴 - 하드 삭제 성공] {}명 유저 삭제 완료. (누적: {}명)", hardDeleteTargets.size(), totalDeletedCount);
        }

        log.info("[회원 탈퇴 - 하드 삭제 실패] 전체 청소 완료. (총 {}명 삭제 완료)", totalDeletedCount);
    }
}
