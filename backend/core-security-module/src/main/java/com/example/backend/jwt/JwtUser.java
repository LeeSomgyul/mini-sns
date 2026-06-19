package com.example.backend.jwt;

public record JwtUser(
        Long userId,
        String role
) {
}
