//중복 확인
package com.example.backend.common.exception;

public class DuplicateResourceException extends RuntimeException{
    public DuplicateResourceException(String message){
        super(message);
    }
}
