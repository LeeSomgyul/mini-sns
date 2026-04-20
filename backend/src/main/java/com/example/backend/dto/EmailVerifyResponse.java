package com.example.backend.dto;

import lombok.Builder;

@Builder
public record EmailVerifyResponse(
        String verifyToken
){}

/*
@Builder
public record EmailVerifyResponse (
        String status,
        String message,
        Data data
){
    @Builder
    public record Data(
            String verifyToken
    ){}
}
*/
