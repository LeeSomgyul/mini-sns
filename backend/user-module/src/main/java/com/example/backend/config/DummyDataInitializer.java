package com.example.backend.config;

import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.kafka.UserUpdatedPublisher;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// [user모듈 서버 실행 시 유저 더미데이터 10명 생성]
// 🚨개발 완료 후 제거하기🚨
@Slf4j
@Component
@Profile("local") // 로컬 개발 환경에서만 작동
@RequiredArgsConstructor
public class DummyDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final LocalAccountRepository localAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserUpdatedPublisher userUpdatedPublisher;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {

        // 1. 기존 더미데이터 삭제
        log.info("[기존 더미데이터 삭제 시작] 기존 더미 유저 데이터를 초기화(삭제)합니다...");

        localAccountRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // 2. 더미유저 생성 시작
        log.info("[더미데이터 생성 시작] 테스트를 위한 더미 유저 10명 생성을 시작합니다...");

        String[] names = {"이민준", "김서연", "김도윤", "최서현", "박예준", "박하은", "이지호", "최지민", "김준우", "이수아"};
        String[] nicknames =  {"쾌활한곰", "새벽매크로", "코딩노예", "치킨요정", "커피중독자", "에러헌터", "자바마스터", "스프링클라우드", "도커대장", "카프카보이"};
        String defaultPasswordHash = passwordEncoder.encode("password123!");

        for(int i = 0; i<10; i++){
            String name = names[i];
            String nickname = nicknames[i];
            String email = "dummy" + i + "@test.com";
            String phoneNumber = "010-1234-56" + String.format("%02d", i + 1);

            User user = User.builder()
                    .name(name)
                    .nickname(nickname)
                    .phoneNumber(phoneNumber)
                    .build();
            userRepository.save(user);

            LocalAccount localAccount = LocalAccount.builder()
                    .user(user)
                    .email(email)
                    .passwordHash(defaultPasswordHash)
                    .build();
            localAccountRepository.save(localAccount);

            userUpdatedPublisher.publisherUserUpdated(
                    user.getId(),
                    user.getName(),
                    user.getNickname(),
                    null,
                    user.getStatus()
            );
        }

        log.info("[더미데이터 생성 완료] 더미 유저 10명 및 엘라스틱서치 동기화 완료!");
    }
}
