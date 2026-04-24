package com.unisphere.dto;

import java.time.LocalDateTime;
import java.util.List;

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

    public ResourceResponse() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public int getAvailabilityWindowCount() {
        return availabilityWindowCount;
    }

    public void setAvailabilityWindowCount(int availabilityWindowCount) {
        this.availabilityWindowCount = availabilityWindowCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
