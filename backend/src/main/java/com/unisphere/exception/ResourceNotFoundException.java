package com.unisphere.exception;

/**
 * Exception thrown when a resource is not found
 */
public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
