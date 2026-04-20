package com.example.backend.dto;

import lombok.Builder;

@Builder
public record EmailSendResponse(
        int expiresIn
) {}



/*
@Builder
public record EmailSendResponse (
        String status,
        String message,
        Data data
){
    @Builder
    public record Data(
            int expiresIn
    ){}
}
*/