package com.unisphere.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Notification Entity for MongoDB
 * Member 04: Notification Module
 */
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private String message;

    private String type; // e.g., REGISTRATION_PENDING, BOOKING

    /** Applicant / related user id (e.g. new registration user id) */
    private String relatedUserId;

    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean isRead = false;

    public Notification() {
    }

    public Notification(String id, String userId, String message, String type, LocalDateTime createdAt, Boolean isRead) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.isRead = isRead != null ? isRead : false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRelatedUserId() {
        return relatedUserId;
    }

    public void setRelatedUserId(String relatedUserId) {
        this.relatedUserId = relatedUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean read) {
        isRead = read;
    }
}
