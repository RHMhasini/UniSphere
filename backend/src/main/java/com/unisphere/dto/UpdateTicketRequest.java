package com.unisphere.dto;

import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Used for PATCH or PUT updates to ticket metadata fields
 * (title, description, category, priority, location, contact info, attachments).
 * All fields are optional — only non-null values will be applied.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketRequest {
    private String title;
    private String description;
    private Category category;
    private TicketPriority priority;
    private String location;

    @Email(message = "Contact email must be a valid email address")
    private String contactEmail;

    private String contactPhone;
    private List<String> attachments;
}
