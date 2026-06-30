package com.example.backend.exception;

public class RedisLockTimeoutException extends RuntimeException {
    public RedisLockTimeoutException(String message) {
        super(message);
    }
}
