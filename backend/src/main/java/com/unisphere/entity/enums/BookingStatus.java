package com.unisphere.entity.enums;

/**
 * Booking Status Enumeration
 * Workflow: PENDING -> APPROVED/REJECTED -> CANCELLED (if approved)
 */
public enum BookingStatus {
    PENDING("Pending approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");

    private final String description;

    BookingStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
