package com.example.backend.controller;

import com.example.backend.dto.common.ApiResponse;
import com.example.backend.dto.feed.FeedResponse;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.feed.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/feed")
public class FeedController {

    private final FeedService feedService;

    //[친구 기반 메인 Feed 조회 API]
    /*
    * @Param loginUser: 현재 로그인한 사용자 객체
    * @Param cursorId: 마지막으로 조회된 게시물의 ID (첫 페이지 요청 시 null)
    * @Param size: 한 페이지당 출력할 게시물 개수 (기본값 20)
    */
    @GetMapping
    public ResponseEntity<ApiResponse<FeedResponse>> getFeedTimeline(
            @AuthenticationPrincipal CustomUserDetails loginUser,
            @RequestParam(value = "cursorId", required = false) Long cursorId,
            @RequestParam(value = "size", defaultValue = "20")int size

    ){
        Long currentUserId = loginUser.userId();

        int validatedSize = size;
        if(size <= 0 || size > 100){
            validatedSize = 20;
        }

        FeedResponse response = feedService.getFeedTimeline(currentUserId, cursorId, validatedSize);
        return ResponseEntity.ok(ApiResponse.success("피드가 조회되었습니다.", response));
    }
}
