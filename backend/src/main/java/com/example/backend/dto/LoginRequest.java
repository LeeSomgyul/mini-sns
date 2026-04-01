//로그인 시 사용자가 전송하는 데이터
package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "비밀번호를 입력해 주세요.")
        String password
){}

/*
@Getter
@NoArgsConstructor
public class LoginRequest {

    @NotBlank(message = "입력란을 확인해 주세요.")
    @Email(message = "입력란을 확인해 주세요.")
    private String email;

    @NotBlank(message = "입력란을 확인해 주세요.")
    private String password;
}
*/
