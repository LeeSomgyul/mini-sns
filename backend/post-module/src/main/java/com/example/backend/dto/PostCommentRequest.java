package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostCommentRequest(

        @NotBlank(message = "댓글 내용은 필수입니다.")
        @Size(max = 300, message = "댓글은 최대 300자까지 입력할 수 있습니다.")
        String content
) {
}
