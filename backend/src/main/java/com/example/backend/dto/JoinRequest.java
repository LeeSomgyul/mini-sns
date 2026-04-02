//회원가입 요청
package com.example.backend.dto;

import jakarta.validation.constraints.*;

public record JoinRequest (

        @NotBlank(message = "이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "비밀번호를 입력해 주세요.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{10,20}$",
                message = "비밀번호는 10~20자, 영문/숫자/특수문자를 포함해야 합니다.")
        String password,

        @NotBlank(message = "닉네임을 입력해 주세요.")
        @Size(min = 2, max = 10, message = "닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.")
        @Pattern(regexp = "^[가-힣a-zA-Z0-9]+$", message = "닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.")
        String nickname,

        @Size(max = 10, message = "이름은 한글과 영문 1~10자 이내로 입력 가능합니다. ")
        @Pattern(regexp = "^[가-힣a-zA-Z]*$", message = "이름은 한글과 영문 1~10자 이내로 입력 가능합니다.")
        String name,

        @Pattern(regexp = "^[0-9]{11}$", message = "전화번호는 11자리 숫자만 가능합니다.")
        String phoneNumber,

        @NotBlank(message = "이메일 인증을 다시 진행해주세요.")
        String verificationToken,

        String deviceToken
){}
