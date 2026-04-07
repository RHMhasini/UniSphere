package com.unisphere.controller.auth;

import com.unisphere.dto.request.RegisterDetailsRequest;
import com.unisphere.dto.request.UpdateProfileRequest;
import com.unisphere.dto.response.ApiResponse;
import com.unisphere.dto.response.AuthResponse;
import com.unisphere.dto.response.UserProfileResponse;
import com.unisphere.entity.enums.UserRole;
import com.unisphere.service.auth.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Authentication Controller
 * Handles OAuth 2.0 login, logout, and JWT token operations
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    /**
     * Submit additional registration details
     */
    @PostMapping("/register/details")
    public ResponseEntity<ApiResponse<UserProfileResponse>> submitDetails(@Valid @RequestBody RegisterDetailsRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UserProfileResponse response = authService.submitAdditionalDetails(email, request);
            return ResponseEntity.ok(ApiResponse.success(response, "Additional details submitted successfully. Waiting for admin approval."));
        } catch (Exception e) {
            log.error("Error submitting additional details", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to submit details: " + e.getMessage()));
        }
    }

    /**
     * Admin: Approve user registration
     */
    @PutMapping("/admin/users/{userId}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> approveUser(@PathVariable String userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication.getName();
            
            UserProfileResponse response = authService.approveUser(adminEmail, userId);
            return ResponseEntity.ok(ApiResponse.success(response, "User approved successfully"));
        } catch (Exception e) {
            log.error("Error approving user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to approve user: " + e.getMessage()));
        }
    }

    /**
     * Admin: Reject user registration
     */
    @PutMapping("/admin/users/{userId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> rejectUser(@PathVariable String userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication.getName();
            
            UserProfileResponse response = authService.rejectUser(adminEmail, userId);
            return ResponseEntity.ok(ApiResponse.success(response, "User rejected successfully"));
        } catch (Exception e) {
            log.error("Error rejecting user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to reject user: " + e.getMessage()));
        }
    }

    /**
     * Get current authenticated user profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UserProfileResponse userProfile = authService.getCurrentUser(email);
            return ResponseEntity.ok(ApiResponse.success(userProfile, "User profile retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving current user", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
    }

    /**
     * Update current user profile
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest updates) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UserProfileResponse userProfile = authService.updateProfile(email, updates);
            return ResponseEntity.ok(ApiResponse.success(userProfile, "Profile updated successfully"));
        } catch (Exception e) {
            log.error("Error updating profile", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    /**
     * Delete current user account
     */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteOwnAccount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            authService.deleteAccount(email);
            return ResponseEntity.ok(ApiResponse.success(null, "Account deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting account", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete account"));
        }
    }

    /**
     * Admin: Update user role
     */
    @PutMapping("/admin/users/{userId}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> roleUpdate) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication.getName();
            
            UserRole newRole = UserRole.valueOf(roleUpdate.get("role"));
            UserProfileResponse updatedUser = authService.updateUserRole(adminEmail, userId, newRole);
            
            return ResponseEntity.ok(ApiResponse.success(updatedUser, "User role updated successfully"));
        } catch (Exception e) {
            log.error("Error updating user role", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update role: " + e.getMessage()));
        }
    }

    /**
     * Admin: Delete any user
     */
    @DeleteMapping("/admin/users/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication.getName();
            
            authService.deleteUser(adminEmail, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete user"));
        }
    }

    /**
     * Admin: Get all users
     */
    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        try {
            List<UserProfileResponse> users = authService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.success(users, "All users retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users"));
        }
    }
    
    /**
     * Logout user
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            authService.logout(email);
            return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
        } catch (Exception e) {
            log.error("Error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Logout failed"));
        }
    }
    
    /**
     * Refresh access token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        try {
            String token = refreshToken.replace("Bearer ", "");
            AuthResponse response = authService.refreshToken(token);
            return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
        } catch (Exception e) {
            log.error("Error refreshing token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid refresh token"));
        }
    }
}
