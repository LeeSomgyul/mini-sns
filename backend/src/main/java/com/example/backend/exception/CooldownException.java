package com.example.backend.exception;

//429 Too Many Requests 에러
public class CooldownException extends RuntimeException {
    public CooldownException(String message) {
        super(message);
    }
}
