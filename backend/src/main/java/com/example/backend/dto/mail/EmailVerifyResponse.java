package com.example.backend.dto.mail;

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


