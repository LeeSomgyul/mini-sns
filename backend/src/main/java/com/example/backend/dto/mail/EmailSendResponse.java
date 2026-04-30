package com.example.backend.dto.mail;

import lombok.Builder;

@Builder
public record EmailSendResponse(
        int expiresIn
) {
    public static EmailSendResponse form(int expiresIn){
        return new EmailSendResponse(
                expiresIn
        );
    }
}
