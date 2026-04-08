package com.unisphere.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Resource type is required")
    private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    /** List of time window strings e.g. ["08:00-12:00", "13:00-17:00"] */
    private List<String> availabilityWindows;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE or OUT_OF_SERVICE
}
