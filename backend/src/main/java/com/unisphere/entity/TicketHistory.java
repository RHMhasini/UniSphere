package com.unisphere.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.unisphere.enums.TicketStatus;

import java.time.LocalDateTime;

@Document(collection = "ticket_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketHistory {
    @Id
    private String id;

    private String ticketId;
    private TicketStatus oldStatus;
    private TicketStatus newStatus;
    private String changedBy;  // HARDCODED: "tech123"

    @CreatedDate
    private LocalDateTime changedAt;
}
