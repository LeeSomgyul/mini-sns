package com.example.backend.exception;

public class EmailSendFailureException extends RuntimeException {
    public EmailSendFailureException(String message) {
        super(message);
    }
}
