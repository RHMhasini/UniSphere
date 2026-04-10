package com.unisphere.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

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

    public ResourceRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<String> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
