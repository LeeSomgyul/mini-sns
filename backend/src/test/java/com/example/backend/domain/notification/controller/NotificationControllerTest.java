package com.example.backend.domain.notification.controller;

import com.example.backend.common.security.JwtTokenProvider;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.support.security.WithMockCustomUser;
import org.junit.jupiter.api.DisplayName;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.mockito.ArgumentMatchers;
import org.mockito.BDDMockito;


@WebMvcTest(NotificationController.class)
class NotificationControllerTest {

    // 스프링이 가짜 브라우저를 만들어서 HTTP 요청 테스트를 할 수 있도록 함
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationService notificationService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockCustomUser //@AuthenticationPrincipal CustomUserDetails 대체
    @DisplayName("SSE 연결 요청 시 상태코드 200과 text/event-stream 타입이 반환되어야 한다")
    void connectTest() throws Exception{
        //[1] GIVEN: 테스트를 위한 가상 데이터 준비
        SseEmitter mockEmitter = new SseEmitter();

        // 1-1. service에게 매게변수 전달 및 응답 받기
        BDDMockito.given(notificationService.subscribe(ArgumentMatchers.anyLong()))
                        .willReturn(mockEmitter);

        //[2] WHEN: 테스트 대상 메서드 실행 & [3] THEN: 결과 확인
        // 2-1. 가짜 브라우저 사용
        // - get: 이 주소로 GET 요청 전송
        // - param: 주소창 뒤에 ?token=fake-token 붙이기
        // - andExpect: 응답으로 200 OK 및 실시간 통신 응답 태그인 TEXT_EVENT_STREAM_VALUE 가 오는지 확인
        mockMvc.perform(MockMvcRequestBuilders.get("/v1/notifications/connect")
                    .param("token", "fake-token"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.TEXT_EVENT_STREAM_VALUE));
    }
}
