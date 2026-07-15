package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.FollowUserResponse;
import com.example.backend.service.UserFollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;

    // [팔로잉 목록 조회] ID 가 userId인 사용자의 팔로잉 목록 조회
    @GetMapping("/{userId}/followings")
    public ResponseEntity<ApiResponse<FollowUserResponse>> getFollowings(
        @PathVariable("userId") Long userId,
        @RequestParam(value = "cursor", required = false) Long cursor,
        @RequestParam(value = "size", defaultValue = "20") int size
    ){
        FollowUserResponse response = userFollowService.getFollowings(userId, cursor, size);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("팔로잉 목록이 조회되었습니다.", response));
    }

    // [팔로우 목록 조회] ID 가 userId인 사용자의 팔로우 목록 조회
    @GetMapping("/{userId}/followers")
    public ResponseEntity<ApiResponse<FollowUserResponse>> getFollowers(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "cursor", required = false) Long cursor,
            @RequestParam(value = "size", defaultValue = "20") int size
    ){
        FollowUserResponse response = userFollowService.getFollowers(userId, cursor, size);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("팔로우 목록이 조회되었습니다.", response));
    }
}
