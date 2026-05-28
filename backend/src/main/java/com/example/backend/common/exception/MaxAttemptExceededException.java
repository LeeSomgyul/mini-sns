package com.example.backend.common.exception;

public class MaxAttemptExceededException extends RuntimeException {
    public MaxAttemptExceededException(String message) {
        super(message);
    }
}
