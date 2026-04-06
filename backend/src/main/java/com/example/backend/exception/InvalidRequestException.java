package com.example.backend.exception;
//로직(Service)에서 잘못된 경우
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
