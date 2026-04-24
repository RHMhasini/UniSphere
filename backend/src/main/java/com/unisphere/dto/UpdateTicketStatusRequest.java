package com.unisphere.dto;

import com.unisphere.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketStatusRequest {

    @NotNull(message = "New status is required")
    private TicketStatus newStatus;

    /** User who is changing the status (technician / admin id) */
    private String changedBy;

    /** Required when newStatus == RESOLVED or CLOSED */
    private String resolutionNote;

    /** Required when newStatus == REJECTED */
    private String rejectionReason;
}
