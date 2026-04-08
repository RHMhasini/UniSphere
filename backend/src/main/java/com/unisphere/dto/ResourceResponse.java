package com.unisphere.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ResourceResponse {

    private String id;
    private String name;
    private String type;
    private int capacity;
    private String location;
    private List<String> availabilityWindows;
    private int availabilityWindowCount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
