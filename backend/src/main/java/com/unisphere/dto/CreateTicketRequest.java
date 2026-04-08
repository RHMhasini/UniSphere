package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketRequest {
    private String title;
    private String description;
    private Category category;
    private TicketPriority priority;
    private String location;
    private String contactEmail;
    private String contactPhone;
    private List<String> attachments;
}
