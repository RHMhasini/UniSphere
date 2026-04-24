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

    private String createdBy;   // user id
    private String assignedTo;  // user id (technician)

    private String location;
    private String contactEmail;
    private String contactPhone;

    private List<String> attachments;

    /** Filled when status moves to RESOLVED / CLOSED */
    private String resolutionNote;

    /** Filled when status is set to REJECTED */
    private String rejectionReason;

    /** Creator (student/lecturer) soft-removed from their own list; staff still see the ticket. */
    @Builder.Default
    private Boolean deletedByStudent = false;

    /** Optional: technician-only soft hide (not used in default flows). */
    @Builder.Default
    private Boolean deletedByTechnician = false;

    /** Admin archive — hidden from normal lists; remains in DB for audit. */
    @Builder.Default
    private Boolean isArchived = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
