package com.example.backend.exception;

import com.example.backend.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //400 Bad Request 에러 처리
    //컨트롤러 도착하자마자 터진 에러
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex){
        //여러 메시지 중 첫 번째 에러 메시지만 가져오기
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(errorMessage)//@Valid, @NotBlank의 에러메시지 출력
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    //400 Bad Request 에러 처리
    //Service 로직 중에 발생된 에러 (if문 등으로 개발자가 작정)
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequestException(InvalidRequestException ex){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(ex.getMessage())//Service에서 보낸 에러메시지 출력
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    //401 Unauthorized 에러 처리
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleLoginError(IllegalArgumentException e){

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }


    //409 Conflict 에러 처리 (중복 처리)
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException e){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    //429 Too Many Requests 에러 처리 (발송: 잦은 요청)
    @ExceptionHandler(CooldownException.class)
    public ResponseEntity<ErrorResponse> handleCooldownException(CooldownException e){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
    }

    //429 Too Many Requests 에러 처리 (검증: 인증번호 확인 5회 초과)
    @ExceptionHandler(MaxAttemptExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxAttemptExceededException(MaxAttemptExceededException ex){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
    }


    //500 Server Error 에러 처리 (메일 발송 실패)
    @ExceptionHandler(EmailSendFailureException.class)
    public ResponseEntity<ErrorResponse> handleEmailSendFailureException(EmailSendFailureException ex){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
