package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.UserSearchResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
        UserSearchResponse searchData = userSearchService.searchUsers(keyword, jwtUser.userId(), pageable);
        ApiResponse<UserSearchResponse> response = ApiResponse.success("사용자 검색 완료", searchData);
        return ResponseEntity.ok(response);
    }
}
