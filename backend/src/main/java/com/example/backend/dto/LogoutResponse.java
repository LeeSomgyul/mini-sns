package com.example.backend.dto;

import lombok.Builder;

@Builder
public record LogoutResponse (
        String status,
        String message
){}
