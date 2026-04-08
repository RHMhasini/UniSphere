package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private String id;
    private String title;
    private String description;
    private Category category;
    private TicketPriority priority;
    private TicketStatus status;
    private String createdBy;
    private String assignedTo;
    private String location;
    private String contactEmail;
    private String contactPhone;
    private List<String> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
