package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.LongStream;

// [feed모듈 서버 실행 시 친구 관계 레디스에 자동 생성]
// 🚨개발 완료 후 제거하기🚨
@Slf4j
@Component
@Profile("local") // 로컬 개발 환경에서만 작동
@RequiredArgsConstructor
public class DummyFollowInitializer implements ApplicationRunner {

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {

        log.info("[더미 팔로우 연결 시작] 현재 등록된 유저들을 기반으로 자동 맞팔로우 세팅을 시작합니다...");

        // 1. 옛날에 레디스에 남아있던 임시 데이터들 제거
        Set<String> keys = stringRedisTemplate.keys("feed:*");
        if(keys!=null && !keys.isEmpty()){
            stringRedisTemplate.delete(keys);
            log.info("[더미 팔로우 실행중] 과거 테스트용 피드 Redis 데이터 {}개를 청소했습니다.", keys.size());
        }

        // 2. 1~100번 가상 id 생성
        List<String> mockUserIds = LongStream.rangeClosed(1, 100)
                .mapToObj(String::valueOf)
                .toList();

        String[] mockUserArray = mockUserIds.toArray(new String[0]);

        // 3. 최적화된 단일 루프 장부 생성 (복잡도 파괴)
        for (String currentUserId : mockUserIds) {
            // 현재 유저를 제외한 나머지 99명의 ID 배열을 필터링으로 바로 추출
            String[] targetsWithoutMe = mockUserIds.stream()
                    .filter(id -> !id.equals(currentUserId))
                    .toArray(String[]::new);

            // 대량의 타겟 배열을 한 번에 SADD로 주입 (네트워크 핑퐁 최소화)
            stringRedisTemplate.opsForSet().add("feed:followers:" + currentUserId, targetsWithoutMe);
            stringRedisTemplate.opsForSet().add("feed:followings:" + currentUserId, targetsWithoutMe);
        }

        // 4. 인플루언서 풀 등록도 루프 밖에서 단 한 방에 처리
        stringRedisTemplate.opsForSet().add("feed:celebrities", mockUserArray);

        log.info("[더미 팔로우 연결 완료] 1~100번 가상 유저의 팔로우 주소록이 세팅되었습니다!");
    }
}
