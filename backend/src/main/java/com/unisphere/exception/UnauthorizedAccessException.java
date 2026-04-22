package com.unisphere.exception;

/**
 * Exception thrown for unauthorized access
 */
public class UnauthorizedAccessException extends ApplicationException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
