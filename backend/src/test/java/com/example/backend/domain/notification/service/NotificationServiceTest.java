package com.example.backend.domain.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

import com.example.backend.domain.notification.dto.NewPostNotificationResponse;
import com.example.backend.domain.notification.repository.SseRepository;
import com.example.backend.domain.notification.service.connection.NotificationTargetConnection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;


@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    //테스트할 실제 서비스 객체
    @InjectMocks
    private NotificationServiceImpl notificationService;

    //가짜 의존성
    @Mock private SseRepository sseRepository;
    @Mock private NotificationTargetConnection notificationTargetConnection;

    @Test
    @DisplayName("유저가 SSE 연결을 요청하면 SseEmitter가 생성되고 저장소에 저장되어야 한다")
    void subscribeTest(){
        //[1] GIVEN: 테스트를 위한 가상 데이터 준비
        Long userId = 1L;

        //[2] WHEN: 테스트 대상 메서드 실행
        SseEmitter sseEmitter = notificationService.subscribe(userId);

        //[3] THEN: 결과 확인
        assertThat(sseEmitter).isNotNull();

        //[검증] SseRepository의 save가 1번만 실행되는지 확인
        // - subscribe에서 sseRepository.save(userId, sseEmitter); 사용하기 때문
        verify(sseRepository, times(1)).save(eq(userId), any(SseEmitter.class));
    }

    @Test
    @DisplayName("친구들이 새 글을 올렸을 때 연관된(친구) 유저들에게 실시간 알림이 에러 없이 전송되어야 한다")
    void broadcastNewPostEventTest() throws Exception{
        //[1] GIVEN: 테스트를 위한 가상 데이터 준비
        Long actorId = 1L; //1번 유저: 게시글 작성자
        Long targetUserId = 2L; //2번 유저: 알림을 받을 친구

        // 1-1. 알림 대상자 id 목록 추출
        // - 1번 유저의 친구 목록으로 2번 유저를 반환하도록 설정
        when(notificationTargetConnection.findTargetUserIds(actorId)).thenReturn(List.of(targetUserId));

        // 1-2. 데이터 전송 목업 대상 생성 후 불러오기
        // - sendToClient의 SseEmitter sseEmitter = sseRepository.get(userId);
        SseEmitter mockEmitter = mock(SseEmitter.class);
        when(sseRepository.get(targetUserId)).thenReturn(mockEmitter);

        // 1-3. 프론트로 전송할 data 조립
        // - 임의 postId 지정
        NewPostNotificationResponse mockData = new NewPostNotificationResponse(123L);

        //[2] WHEN: 테스트 대상 메서드 실행
        notificationService.broadcastNewPostEvent(actorId, mockData);

        //[3] THEN: 결과 확인
        verify(mockEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
    }
}
