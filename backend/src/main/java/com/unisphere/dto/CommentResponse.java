package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private String id;
    private String ticketId;
    private String userId;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
