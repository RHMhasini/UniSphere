package com.unisphere.service.auth;

import com.unisphere.dto.request.RegisterDetailsRequest;
import com.unisphere.dto.request.UpdateProfileRequest;
import com.unisphere.dto.response.AuthResponse;
import com.unisphere.dto.response.UserProfileResponse;
import com.unisphere.entity.enums.UserRole;
import java.util.List;

/**
 * Authentication Service Interface
 * Handles user authentication, registration, and user management
 */
public interface AuthService {
    
    /**
     * Get current user profile
     */
    UserProfileResponse getCurrentUser(String email);
    
    /**
     * Update own profile
     */
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);

    /**
     * Update notification preferences
     */
    UserProfileResponse updatePreferences(String email, java.util.Map<String, Boolean> preferences);

    /**
     * Submit additional registration details
     */
    UserProfileResponse submitAdditionalDetails(String email, RegisterDetailsRequest request);

    /**
     * Admin: Approve user registration
     */
    UserProfileResponse approveUser(String adminEmail, String userId);

    /**
     * Admin: Reject user registration
     */
    UserProfileResponse rejectUser(String adminEmail, String userId);

    /**
     * Delete own account
     */
    void deleteAccount(String email);

    /**
     * Admin: Update user role
     */
    UserProfileResponse updateUserRole(String adminEmail, String userId, UserRole newRole);

    /**
     * Admin: Delete any user
     */
    void deleteUser(String adminEmail, String userId);

    /**
     * Admin: Get all users
     */
    List<UserProfileResponse> getAllUsers();

    /**
     * Logout user (invalidate tokens)
     */
    void logout(String email);
    
    /**
     * Validate JWT token
     */
    Boolean validateToken(String token);
    
    /**
     * Get email from token
     */
    String getEmailFromToken(String token);
    
    /**
     * Refresh access token
     */
    AuthResponse refreshToken(String refreshToken);
}
