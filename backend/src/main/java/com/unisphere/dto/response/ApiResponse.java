package com.unisphere.dto.response;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Standard API Response wrapper
 */
public class ApiResponse<T> implements Serializable {
    
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String path;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, T data, LocalDateTime timestamp, String path) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
        this.path = path;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(true);
        resp.setMessage(message);
        resp.setData(data);
        resp.setTimestamp(LocalDateTime.now());
        return resp;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Request successful");
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(false);
        resp.setMessage(message);
        resp.setTimestamp(LocalDateTime.now());
        return resp;
    }

    public static <T> ApiResponse<T> error(String message, String path) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(false);
        resp.setMessage(message);
        resp.setPath(path);
        resp.setTimestamp(LocalDateTime.now());
        return resp;
    }
}
