package com.unisphere.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler — does NOT extend ResponseEntityExceptionHandler
 * to avoid ambiguous handler conflicts with Spring Boot's built-in handling
 * of MethodArgumentNotValidException.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 Not Found ──────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                build(ex.getMessage(), "Not Found", HttpStatus.NOT_FOUND.value()));
    }

    // ── 403 Forbidden ──────────────────────────────────────────────────────────

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedAccessException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                build(ex.getMessage(), "Forbidden", HttpStatus.FORBIDDEN.value()));
    }

    // ── 400 Validation Errors ─────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(
                build(ex.getMessage(), "Bad Request", HttpStatus.BAD_REQUEST.value()));
    }

    // ── 500 Fall-through ──────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError().body(
                build(ex.getMessage(), "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ErrorResponse build(String message, String error, int status) {
        return ErrorResponse.builder()
                .message(message)
                .error(error)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
