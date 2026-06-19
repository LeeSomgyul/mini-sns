package com.example.backend.exception;

import com.example.backend.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j
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

    //401 Unauthorized 에러 처리 (토큰 값 유효하지 않음)
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTokenException(InvalidTokenException ex){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    //404 Not Found 에러 처리 (데이터, 엔티티 등 요소를 찾을 수 없을때)
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException ex){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
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


    //413 파일 업로드 지정 크기 초과 시
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(errorResponse);
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

    //500 미디어 파일 DB 저장시 실패
    @ExceptionHandler(FileProcessException.class)
    public ResponseEntity<ErrorResponse> handleFileStorageException(FileProcessException ex){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    //500 전역 대표 예외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex){
        log.error("서버 내부 오류 발생: ", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status("error")
                .message("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
