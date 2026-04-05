package com.unisphere.entity.enums;

/**
 * Ticket Status Enumeration
 * Workflow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED (or REJECTED)
 */
public enum TicketStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CLOSED("Closed"),
    REJECTED("Rejected");

    private final String description;

    TicketStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
