package com.example.backend.common.exception;

public class EmailSendFailureException extends RuntimeException {
    public EmailSendFailureException(String message) {
        super(message);
    }
}
