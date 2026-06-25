package com.example.backend.service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.NicknameCheckResponse;
import com.example.backend.dto.response.TagUserProfileResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;

    // [닉네임 중복 확인]
    @Transactional(readOnly = true)
    public ApiResponse<NicknameCheckResponse> checkNicknameDuplicate(String nickname, Long currentUserId){

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
        return ApiResponse.success(message, NicknameCheckResponse.from(exists));
    }

    // [게시물 수정: 기존 태그된 사용자의 정보 불러오기]
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
}
