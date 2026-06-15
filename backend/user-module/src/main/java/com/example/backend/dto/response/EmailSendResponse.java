package com.example.backend.dto.response;

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
