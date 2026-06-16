package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.entity.UserCache;
import com.example.backend.repository.UserCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.example.backend.config.kafka.UserUpdatedEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUpdatedConsumer {

    private final UserCacheRepository userCacheRepository;

    @KafkaListener(
            topics = KafkaTopics.USER_ACCOUNT_UPDATED_TOPIC,
            groupId = "post.user-cache",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumerUserUpdated(UserUpdatedEvent userUpdatedEvent){
        log.info("[post-module] 사용자 계정 정보 업데이트 이벤트 수신 완료: userId={}", userUpdatedEvent.userId());

        // 1. UserCache 엔티티 생성
        UserCache userCache = UserCache.builder()
                .userId(userUpdatedEvent.userId())
                .nickname(userUpdatedEvent.nickname())
                .profileImageUrl(userUpdatedEvent.profileImageUrl())
                .status(userUpdatedEvent.status())
                .build();

        // 2. post_db에 저장
        userCacheRepository.save(userCache);

        log.info("[post-module] post_db 사용자 정보 저장 완료");
    }
}
