package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PostUpdateRequest(

        @NotBlank(message = "본문을 입력해주세요.")
        @Size(max = 500, message = "본문은 500자를 초과할 수 없습니다.")
        String content,
        List<TagUserRequest> tagUsers
) {
    public record TagUserRequest(
            Long userId
    ){}
}