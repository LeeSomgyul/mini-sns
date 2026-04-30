package com.example.backend.dto.mail;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmailSendRequest (

        @NotBlank(message = "이메일을 입력해 주세요.")
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
                message = "올바른 이메일 형식이 아닙니다.")
        String email
){}
