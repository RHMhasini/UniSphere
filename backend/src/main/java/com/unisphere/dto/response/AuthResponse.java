package com.unisphere.dto.response;

import com.unisphere.entity.enums.RegistrationStatus;
import com.unisphere.entity.enums.UserRole;

import java.time.LocalDateTime;

/**
 * Authentication Response DTO
 */
public class AuthResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role;
    private RegistrationStatus registrationStatus;
    private String profilePictureUrl;
    private Boolean emailVerified;
    private String accessToken;
    private String refreshToken;
    private LocalDateTime expiresAt;

    public AuthResponse() {
    }

    public AuthResponse(
            String id,
            String fullName,
            String email,
            String phone,
            UserRole role,
            RegistrationStatus registrationStatus,
            String profilePictureUrl,
            Boolean emailVerified,
            String accessToken,
            String refreshToken,
            LocalDateTime expiresAt
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.registrationStatus = registrationStatus;
        this.profilePictureUrl = profilePictureUrl;
        this.emailVerified = emailVerified;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public RegistrationStatus getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(RegistrationStatus registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
