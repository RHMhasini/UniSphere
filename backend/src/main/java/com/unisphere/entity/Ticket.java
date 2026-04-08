package com.unisphere.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    private String id;

    private String title;
    private String description;
    private Category category;
    private TicketPriority priority;
    private TicketStatus status;

    private String createdBy;  // HARDCODED: "user123"
    private String assignedTo; // HARDCODED: "tech123"

    private String location;
    private String contactEmail;
    private String contactPhone;

    private List<String> attachments;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
