package com.example.backend.common.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ErrorResponse (
        String status,
        String message,
        LocalDateTime timestamp
){}
