package com.example.backend.exception;
//로직(Service)에서 잘못된 경우
//이메일 인증번호 만료된 경우(3분 초과)
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
