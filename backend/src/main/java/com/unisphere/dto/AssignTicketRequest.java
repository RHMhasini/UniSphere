package com.unisphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTicketRequest {

    @NotBlank(message = "assignedTo (technician user id) is required")
    private String assignedTo;

    /** The admin/manager who is making the assignment */
    private String assignedBy;
}
