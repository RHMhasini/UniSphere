package com.unisphere.exception;

/**
 * Exception thrown when booking time conflicts with existing booking
 */
public class BookingConflictException extends ApplicationException {
    public BookingConflictException(String message) {
        super(message);
    }
}
