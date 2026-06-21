package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.document.UserDocument;
import com.example.backend.repository.UserSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUpdatedConsumer {

    private final UserSearchRepository userSearchRepository;

    @KafkaListener(
            topics = KafkaTopics.USER_ACCOUNT_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_USER_SEARCH,
            containerFactory = "kafkaListenerContainerFactory"
    )
    private void consumerUserUpdated(UserUpdatedEvent event){
        log.info("[usersearch-module] 사용자 계정 정보 업데이트 이벤트 수신 완료: userId={}", event.userId());

        // 엘라스틱 서치 도큐먼트 (dto) 주입
        UserDocument userDocument = UserDocument.from(event);

        // 저장
        userSearchRepository.save(userDocument);

        log.info("[usersearch-module] 엘라스틱서치 사용자 정보 저장 완료");
    }
}
