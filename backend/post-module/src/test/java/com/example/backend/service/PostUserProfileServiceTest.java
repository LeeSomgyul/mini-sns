package com.example.backend.service;

import com.example.backend.repository.PostRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
class PostUserProfileServiceTest {

    @Autowired
    private PostUserProfileService postUserProfileService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @MockitoSpyBean
    private PostRepository postRepository;

    private final Long TARGET_USER_ID = 1L;
    private final String REDIS_KEY = "user:" + TARGET_USER_ID + ":post_count";

    @BeforeEach
    void setUp(){
        stringRedisTemplate.delete(REDIS_KEY);
    }

    @AfterEach
    void tearDown(){
        stringRedisTemplate.delete(REDIS_KEY);
    }

    @Test
    @DisplayName("100명의 사용자가 동시에 프로필을 조회해도, 레디스에 저장되어있는 캐시 값이 없을 시 DB(count 쿼리)는 단 1번만 호출되어야 한다.")
    void getPostUserProfile_getPostCountWithLock_Test() throws InterruptedException{
        // [given]
        // 1. 100명의 요청을 준비
        int threadCount = 100;
        // 2. 스레드 32개 사용으로 제한 (시스템 과부하 예방)
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        // 3. 스레드 움직임 제어
        CountDownLatch latch = new CountDownLatch(threadCount);

        // [when]
        // 1. 100개의 스레드가 동시에 getPostUserProfile 메서드 호출
        for(int i=0; i<threadCount; i++){
            executorService.submit(() -> {
                try {
                    postUserProfileService.getPostUserProfile(TARGET_USER_ID);
                }finally {
                    latch.countDown();
                }
            });
        }

        // 2. 모든 스레드의 작업이 끝날 때까지 메인 스레드 대기
        latch.await();

        // [then]
        // 1. Redis에 캐시(데이터)가 정상적으로 저장되었는가?
        String cachedValue = stringRedisTemplate.opsForValue().get(REDIS_KEY);
        assertThat(cachedValue).isNotNull();

        // 2. 100번의 요청이 있었지만, 분산 락으로 DB조회가 1번만 발생되었는가?
        verify(postRepository, times(1)).countByAuthorId(TARGET_USER_ID);

    }
}
