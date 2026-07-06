package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.UserTagRequest;
import com.example.backend.dto.response.UserTagResponse;
import com.example.backend.service.UserTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserTagController {

    private final UserTagService userTagService;

    @PostMapping("/tags")
    public ResponseEntity<ApiResponse<List<UserTagResponse>>> getUserTags(
        @RequestBody UserTagRequest request
    ){
        List<UserTagResponse> response = userTagService.getUserTags(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("태그 유저 정보 응답 성공", response));
    }
}
