package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.unisphere.enums.TicketStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketStatusRequest {
    private TicketStatus newStatus;
}
