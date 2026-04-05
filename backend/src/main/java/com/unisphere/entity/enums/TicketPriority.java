package com.unisphere.entity.enums;

/**
 * Ticket Priority Enumeration
 */
public enum TicketPriority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    CRITICAL("Critical");

    private final String description;

    TicketPriority(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
