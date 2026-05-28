package com.example.backend.domain.user.dto.mail;

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
