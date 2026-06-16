package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import com.example.backend.config.kafka.UserUpdatedEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUpdatedPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // [회원가입, 프로필 변경, 회원 탈퇴]
    public void publisherUserUpdated(Long userId, String nickname, String profileImageUrl, String status){
        com.example.backend.config.kafka.UserUpdatedEvent userUpdatedEvent = new UserUpdatedEvent(userId, nickname, profileImageUrl, status);

        kafkaTemplate.send(
                KafkaTopics.USER_ACCOUNT_UPDATED_TOPIC,
                String.valueOf(userId), // Key로 userId를 보내서 같은 유저의 이벤트 순서 보장
                userUpdatedEvent
        );

        log.info("[user-module] 사용자 계정 정보 업데이트 이벤트 발행 완료: userId={}",userId);
    }
}
