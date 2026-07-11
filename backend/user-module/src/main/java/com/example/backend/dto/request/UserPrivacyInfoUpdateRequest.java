package com.example.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserPrivacyInfoUpdateRequest(
        @Size(min = 2, max = 10, message = "닉네임은 2~10자 이내여야 합니다.")
        @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = "닉네임은 한글, 영문, 숫자만 가능합니다.")
        String nickname,

        @Pattern(regexp = "^[0-9]{11}$", message = "전화번호는 11자리 숫자만 가능합니다.")
        String phoneNumber,

        String profileImageUrl,
        Boolean isPasswordChanging, // 비밀번호 변경 모드가 켜져있는지 여부
        String currentPassword,
        String newPassword
) {
}
