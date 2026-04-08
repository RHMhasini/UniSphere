package com.unisphere.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.unisphere.enums.NotificationType;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    private String id;

    private String userId;              // HARDCODED: "user123"
    private String message;
    private NotificationType type;
    private boolean isRead;

    @CreatedDate
    private LocalDateTime createdAt;
}
