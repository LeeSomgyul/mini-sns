package com.example.backend.controller;


import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.NicknameCheckResponse;
import com.example.backend.dto.response.TagUserProfileResponse;
import com.example.backend.service.UserService;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    // [닉네임 중복 체크]
    @GetMapping("/nickname/exists")
    public ResponseEntity<ApiResponse<NicknameCheckResponse>> checkNickName (
            @RequestParam
            //1.유효성 검사
            @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = "닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.")
            String nickname
    ){
        //2.현재 로그인한 userId 가져오기 (로그인하지 않았다면 null 반환)
        Long currentUserId = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();//현재 로그인한 사용자의 종합정보

        //authentication != null: 기존 회원가입한 유저인가?
        //authentication.isAuthenticated(): 우리 시스템에서 회원가입한거 맞나?
        //!authentication.getPrincipal().equals("anonymousUser"): 익명이 아닌가?
        if(authentication != null && authentication.isAuthenticated()
            && !authentication.getPrincipal().equals("anonymousUser")){

            Object principal = authentication.getPrincipal();

            //데이터 타입이 Long것이 있나? (userId가 Long형임)
            if(principal instanceof Long){
                currentUserId = (Long) principal;
            }else if(principal instanceof String){
                //토큰의 문자열을 Long형으로 변경
                currentUserId = Long.valueOf((String) principal);
            }
        }

        ApiResponse<NicknameCheckResponse> response = userService.checkNicknameDuplicate(nickname, currentUserId);

        return ResponseEntity.ok(response);
    }

    // [게시물 수정: 기존 태그된 사용자의 정보 불러오기]
    @GetMapping("/tags")
    public ResponseEntity<ApiResponse<List<TagUserProfileResponse>>> getTagUserProfile(
            @RequestParam("userIds") List<Long> userIds
    ){
        List<TagUserProfileResponse> response = userService.getTagUserProfile(userIds);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("태그 사용자 정보 가져오기 성공", response));
    }
}
