package com.example.backend.dto.common;

import lombok.Builder;

//Response 공통 틀 (우리 백엔드 -> 우리 프론트로 넘겨줄때의 성공 응답 약속)
//T: 어떤 타입의 응답이 들어올지 모른다는 뜻(PostResponse, JoinResponse... 등)
@Builder
public record ApiResponse<T> (
    String status,
    String message,
    T data
){
    public static <T> ApiResponse<T> success(String message, T data){
        return ApiResponse.<T>builder()
                .status("success")
                .message(message)
                .data(data)
                .build();
    }
}
