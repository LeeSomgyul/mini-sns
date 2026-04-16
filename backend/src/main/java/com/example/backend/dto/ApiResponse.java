package com.example.backend.dto;

import lombok.Builder;

//Response 공통 틀
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
