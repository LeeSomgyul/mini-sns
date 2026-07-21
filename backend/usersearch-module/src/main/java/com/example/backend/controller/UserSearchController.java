package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.TagUserSearchRequest;
import com.example.backend.dto.TagUserSearchResponse;
import com.example.backend.dto.UserSearchResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.shaded.com.google.protobuf.Api;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/search")
@RequiredArgsConstructor
@Validated
public class UserSearchController {

    private final UserSearchService userSearchService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<UserSearchResponse>> searchUsers(
            @RequestParam(name = "keyword") String keyword,
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ){
        Pageable pageable = PageRequest.of(page, size);
        UserSearchResponse response = userSearchService.searchUsers(keyword, jwtUser.userId(), pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("전체 사용자 검색 완료", response));
    }

    @GetMapping("/tagUsers")
    public ResponseEntity<ApiResponse<TagUserSearchResponse>> searchTagUsers(
            @AuthenticationPrincipal JwtUser jwtUser,
            @ModelAttribute TagUserSearchRequest request
    ){
            TagUserSearchResponse response = userSearchService.searchTagUsers(jwtUser.userId(), request);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(ApiResponse.success("팔로우 기반 사용자 검색 완료", response));
    }
}
