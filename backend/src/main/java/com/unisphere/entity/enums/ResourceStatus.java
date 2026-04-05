package com.unisphere.entity.enums;

/**
 * Resource Status Enumeration
 * Status of facilities and assets
 */
public enum ResourceStatus {
    ACTIVE("Active and Available"),
    OUT_OF_SERVICE("Out of Service"),
    MAINTENANCE("Under Maintenance"),
    RESERVED("Reserved");

    private final String description;

    ResourceStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
