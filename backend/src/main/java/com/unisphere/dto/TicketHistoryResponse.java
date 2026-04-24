package com.unisphere.dto;

import com.unisphere.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketHistoryResponse {
    private String id;
    private String ticketId;
    private TicketStatus oldStatus;
    private TicketStatus newStatus;
    private String changedBy;
    private LocalDateTime changedAt;
}
