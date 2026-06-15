package com.example.backend.dto.response;

import lombok.Builder;

@Builder
public record EmailVerifyResponse(
        String verifyToken
){
    public static EmailVerifyResponse form(String verifyToken){
        return new EmailVerifyResponse(
                verifyToken
        );
    }
}


