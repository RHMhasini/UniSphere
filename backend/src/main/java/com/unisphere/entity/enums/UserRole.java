package com.unisphere.entity.enums;

/**
 * User Role Enumeration
 * Roles: USER (general user), ADMIN (system admin), TECHNICIAN (maintenance staff), MANAGER (facility manager)
 */
public enum UserRole {
    STUDENT("Student"),
    LECTURER("Lecturer"),
    TECHNICIAN("Technician"),
    ADMIN("Administrator");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
