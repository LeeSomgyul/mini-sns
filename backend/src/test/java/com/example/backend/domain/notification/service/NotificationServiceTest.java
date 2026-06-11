package com.example.backend.domain.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

import com.example.backend.domain.notification.repository.SseRepository;
import com.example.backend.domain.notification.service.connection.NotificationTargetConnection;
import com.example.backend.infrastructure.kafka.Notification.NotificationFeedEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;


import java.io.IOException;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.function.Consumer;


@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    //테스트할 실제 서비스 객체
    @InjectMocks
    private NotificationServiceImpl notificationService;

    //가짜 의존성
    @Mock private SseRepository sseRepository;
    @Mock private SseEmitterFactory sseEmitterFactory;
    @Mock private NotificationTargetConnection notificationTargetConnection;

    // ==============================
    //     subscribe() 테스트
    // ==============================

    @Test
    @DisplayName("유저가 SSE 연결을 요청하면 SseEmitter가 생성되고 저장소에 저장되어야 한다")
    void subscribeTest() throws Exception{
        // ==========================================
        // 1. 성공 흐름 테스트 (정상 동작 시)
        // ==========================================
        //[1] GIVEN: 테스트를 위한 가상 데이터 준비
        Long userId = 1L;

        SseEmitter mockEmitter = mock(SseEmitter.class);
        when(sseEmitterFactory.create(anyLong())).thenReturn(mockEmitter);

        //[2] WHEN: 테스트 대상 메서드 실행
        SseEmitter result = notificationService.subscribe(userId);

        //[3] THEN: 결과 확인
        // 3-1. 반환된 Emitter 유무 검증
        assertThat(result).isNotNull();

        // 3-2. sseRepository.save(userId, sseEmitter) 저장 여부 검증
        verify(sseRepository, timeout(100).times(1)).save(userId, result);

        // UUID나 내부 구현체에 구애받지 않고, send()가 호출 되는지만 체크
        verify(mockEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));

        // 3-3. 메모리 누수 차단 검증
        ArgumentCaptor<Runnable> completionCaptor = ArgumentCaptor.forClass(Runnable.class);
        ArgumentCaptor<Runnable> timeoutCaptor = ArgumentCaptor.forClass(Runnable.class);
        ArgumentCaptor<Consumer> errorCaptor = ArgumentCaptor.forClass(Consumer.class);

        // 콜백 함수 가로채기
        verify(mockEmitter).onCompletion(completionCaptor.capture());
        verify(mockEmitter).onTimeout(timeoutCaptor.capture());
        verify(mockEmitter).onError(errorCaptor.capture());

        // 가로챈 콜백 함수를 테스트 환경에서 실행
        Runnable completionCallback = completionCaptor.getValue();
        completionCallback.run();
        verify(sseRepository, times(1)).deleteById(userId);

        Runnable timeoutCallback = timeoutCaptor.getValue();
        timeoutCallback.run();
        verify(sseRepository, times(2)).deleteById(userId);

        Consumer errorCallback = errorCaptor.getValue();
        errorCallback.accept(new RuntimeException("SSE 테스트 에러"));
        verify(sseRepository, times(3)).deleteById(userId);

        // ==========================================
        // 2. 예외 흐름 테스트 (catch 검증)
        // ==========================================
        //[1] GIVEN: 테스트를 위한 가상 데이터 준비
        Long errorUserId = 999L;

        // 강제로 send() 메서드 호출되면 IOException 예외 던지기
        SseEmitter mockErrorEmitter = mock(SseEmitter.class);
        doThrow(new IOException("강제 연결 끊김 예외 발생"))
                .when(mockErrorEmitter).send(any(SseEmitter.SseEventBuilder.class));

        //[2] WHEN: 테스트 대상 메서드 실행
        // SseEmitterFactory가 에러를 반환하도록 아무 값이나 넣기
        when(sseEmitterFactory.create(anyLong())).thenReturn(mockErrorEmitter);

        // 로직 실행
        notificationService.subscribe(errorUserId);

        //[3] THEN: 결과 확인
        // catch 문에 걸려서 deleteById가 실행 되는지 확인
        verify(sseRepository, times(1)).deleteById(errorUserId);

        // 예외가 실행되기 전, 실제로 send()가 호출 되었는지 확인
        verify(mockErrorEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
    }

    // [subscribeTest 보조 함수]
    private Object getPrivateField(Object object, String fieldName) throws Exception{
        // fieldName에 해당하는 Field 객체 가져오기
        Field field = object.getClass().getDeclaredField(fieldName);
        // private 보안 무력화
        field.setAccessible(true);
        return field.get(object);
    }


    // ==============================
    //     sendToClient() 테스트
    // ==============================

    // [성공 흐름 테스트]
    @Test
    @DisplayName("Kafka 이벤트 수신 시 저장된 Emitter가 있으면 알림을 전송한다")
    void sendToClient_Success() throws  Exception{
        // [1] GIVEN
        Long userId = 1L;
        NotificationFeedEvent mockEvent = new NotificationFeedEvent(
                "NEW_POST",
                userId,
                2L,
                100L,
                LocalDateTime.now()
        );

        SseEmitter mockEmitter = mock(SseEmitter.class);
        when(sseRepository.get(userId)).thenReturn(mockEmitter);

        // [2] WHEN
        notificationService.sendToClient(userId, mockEvent);

        // [3] THEN
        // 3-1. sseEmitter.send() 실행 했는지 검증
        verify(mockEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
        // 3-2. sseRepository.deleteById()를 한번도 실행 안한거 맞는지 확인
        verify(sseRepository, never()).deleteById(anyLong());
    }

    // [예외 흐름 테스트] catch() 테스트
    // - SSE 연결되어 있지만, 전송하는 순간 네트워크 끊김
    @Test
    @DisplayName("프론트에 알림 전송 중 IOException이 발생하면 Emitter를 저장소에서 제거한다")
    void sendToClient_Exception() throws  Exception{
        // [1] GIVEN
        Long errorUserId = 999L;
        NotificationFeedEvent mockEvent = new NotificationFeedEvent(
                "NEW_POST",
                errorUserId,
                2L,
                200L,
                LocalDateTime.now()
        );

        SseEmitter mockErrorEmitter = mock(SseEmitter.class);
        when(sseRepository.get(errorUserId)).thenReturn(mockErrorEmitter);

        doThrow(new IOException("네트워크 끊김 현상 발생"))
                .when(mockErrorEmitter).send(any(SseEmitter.SseEventBuilder.class));

        // [2] WHEN
        notificationService.sendToClient(errorUserId, mockEvent);

        // [3] THEN
        // - catch 블록으로 정상 진입하여 sseRepository.deleteById() 가 수행되었는지 검증
        verify(sseRepository, times(1)).deleteById(errorUserId);
    }

    // [에러 흐름 테스트] if(sseEmitter != null){}에서 거부되었을 경우 테스트
    // - 이미 SSE 연결이 종료된 상황 (로그아웃, 타입아웃, 에러 등)
    @Test
    @DisplayName("저장소에 해당 유저의 SseEmitter가 없으면 아무 행위도 하지 않고 종료한다")
    void sendToClient_EmitterNotFound() throws  Exception{
        // [1] GIVEN
        Long exUserId = 777L;
        NotificationFeedEvent mockEvent = new NotificationFeedEvent(
                "NEW_POST",
                exUserId,
                2L,
                300L,
                LocalDateTime.now()
        );

        // sseEmitter = null 명시
        when(sseRepository.get(exUserId)).thenReturn(null);

        // [2] WHEN
        notificationService.sendToClient(exUserId, mockEvent);

        // [3] THEN
        // - 레포지토리 삭제 로직이 호출되지 않아야 함
        verify(sseRepository, never()).deleteById(anyLong());
    }
}
