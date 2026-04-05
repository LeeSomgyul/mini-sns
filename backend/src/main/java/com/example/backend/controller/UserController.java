package com.example.backend.controller;

import com.example.backend.dto.NicknameCheckResponse;
import com.example.backend.service.UserService;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping("/nickname/exists")
    public ResponseEntity<NicknameCheckResponse> checkNickName (
            @RequestParam
            //1.유효성 검사
            @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = "닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.")
            String nickname
    ){
        //2.현재 로그인한 userId 가져오기 (로그인하지 않았다면 null 반환)
        Long currentUserId = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();//현재 로그인한 사용자의 종합정보
        //authentication이 null이라는건 기존 사용자가 아닌 신규라는 의미. && 종합정보 중에 Long타입이 있는지 (userId가 Long 타입이니까)
        if(authentication != null && authentication.getPrincipal() instanceof Long){
            currentUserId = (Long) authentication.getPrincipal();//if문이 true라면 기존 회원이라는 의미
        }

        NicknameCheckResponse response = userService.checkNicknameDuplicate(nickname, currentUserId);

        return ResponseEntity.ok(response);
    }
}
