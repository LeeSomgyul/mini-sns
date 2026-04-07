package com.example.backend.exception;

public class MaxAttemptExceededException extends RuntimeException {
    public MaxAttemptExceededException(String message) {
        super(message);
    }
}
