package com.unisphere.entity.enums;

/**
 * Registration Status Enumeration
 * Status: 
 * - PENDING_DETAILS: New user, needs to fill additional details
 * - PENDING_APPROVAL: Details submitted, waiting for admin approval
 * - APPROVED: Account approved, full access granted
 * - REJECTED: Account rejected by admin
 */
public enum RegistrationStatus {
    PENDING_DETAILS("Pending Details"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    REJECTED("Rejected");

    private final String description;

    RegistrationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
