package com.unisphere.dto;

import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    /**
     * The user who created the ticket.
     * In the current "mock auth header" phase, the backend will prefer the authenticated
     * principal from headers (X-User-Email). This field is therefore optional.
     */
    private String createdBy;

    /** Optional — can be assigned later via PUT /assign */
    private String assignedTo;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 100, message = "Location must be between 3 and 100 characters")
    private String location;

    @Email(message = "Contact email must be a valid email")
    private String contactEmail;

    private String contactPhone;

    @Builder.Default
    private List<String> attachments = new ArrayList<>();
}
