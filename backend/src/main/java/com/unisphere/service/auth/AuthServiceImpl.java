package com.unisphere.service.auth;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import com.unisphere.dto.request.RegisterDetailsRequest;
import com.unisphere.dto.request.UpdateProfileRequest;
import com.unisphere.dto.response.AuthResponse;
import com.unisphere.dto.response.UserProfileResponse;
import com.unisphere.entity.User;
import com.unisphere.entity.enums.RegistrationStatus;
import com.unisphere.entity.enums.UserRole;
import com.unisphere.exception.ResourceNotFoundException;
import com.unisphere.exception.UnauthorizedAccessException;
import com.unisphere.repository.UserRepository;
import com.unisphere.security.JwtTokenProvider;
import com.unisphere.service.notification.NotificationService;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private NotificationService notificationService;

    @Override
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setPhone(request.getPhone());

        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        // FIX: Replaced if-else chain with switch expression
        switch (user.getRole()) {
            case STUDENT -> {
                user.setFaculty(request.getFaculty());
                user.setDegreeProgram(request.getDegreeProgram());
                user.setYear(request.getYear());
                user.setSemester(request.getSemester());
            }
            case LECTURER -> {
                user.setStaffId(request.getStaffId());
                user.setFaculty(request.getFaculty());
                user.setDepartment(request.getDepartment());
                user.setDesignation(request.getDesignation());
            }
            case TECHNICIAN -> {
                user.setStaffId(request.getStaffId());
                user.setDepartment(request.getDepartment());
                user.setSpecialization(request.getSpecialization());
                user.setAssignedLab(request.getAssignedLab());
            }
            default -> log.warn("No role-specific fields to update for role: {}", user.getRole());
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        log.info("Profile updated for user: {}", email);

        return mapToUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse submitAdditionalDetails(String email, RegisterDetailsRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setRegistrationStatus(RegistrationStatus.PENDING_APPROVAL);

        // FIX: Replaced if-else chain with switch expression
        switch (request.getRole()) {
            case STUDENT -> {
                user.setFaculty(request.getFaculty());
                user.setDegreeProgram(request.getDegreeProgram());
                user.setYear(request.getYear());
                user.setSemester(request.getSemester());
            }
            case LECTURER -> {
                user.setStaffId(request.getStaffId());
                user.setFaculty(request.getFaculty());
                user.setDepartment(request.getDepartment());
                user.setDesignation(request.getDesignation());
            }
            case TECHNICIAN -> {
                user.setStaffId(request.getStaffId());
                user.setDepartment(request.getDepartment());
                user.setSpecialization(request.getSpecialization());
                user.setAssignedLab(request.getAssignedLab());
            }
            default -> log.warn("Unknown role provided: {}", request.getRole());
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        log.info("Additional details submitted for user: {}", email);

        try {
            notificationService.notifyAdminsNewRegistration(user);
        } catch (Exception e) {
            log.error("Failed to notify admins about new registration: {}", e.getMessage());
        }

        return mapToUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse approveUser(String adminEmail, String userId) {
        validateAdmin(adminEmail);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRegistrationStatus(RegistrationStatus.APPROVED);
        user.setIsActive(true);
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("Admin {} approved user {}", adminEmail, user.getEmail());

        return mapToUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse rejectUser(String adminEmail, String userId) {
        validateAdmin(adminEmail);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRegistrationStatus(RegistrationStatus.REJECTED);
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("Admin {} rejected user {}", adminEmail, user.getEmail());

        return mapToUserProfileResponse(user);
    }

    private void validateAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can perform this action");
        }
    }

    @Override
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
        log.info("User deleted their own account: {}", email);
    }

    @Override
    public UserProfileResponse updateUserRole(String adminEmail, String userId, UserRole newRole) {
        validateAdmin(adminEmail);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("Admin {} updated role of {} to {}", adminEmail, user.getEmail(), newRole);

        return mapToUserProfileResponse(user);
    }

    @Override
    public void deleteUser(String adminEmail, String userId) {
        validateAdmin(adminEmail);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
        log.info("Admin {} deleted user account: {}", adminEmail, user.getEmail());
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void logout(String email) {
        log.info("User logged out: {}", email);
    }

    @Override
    public Boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }

    @Override
    public String getEmailFromToken(String token) {
        return jwtTokenProvider.getEmailFromToken(token);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // FIX: Replaced single catch(Exception) with specific multicatch
        try {
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                throw new BadCredentialsException("Invalid refresh token");
            }

            String email = jwtTokenProvider.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (!user.getIsActive()) {
                throw new BadCredentialsException("User account is inactive");
            }

            String accessToken = jwtTokenProvider.generateAccessToken(
                    user.getEmail(), user.getId(), user.getRole().name());
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                    user.getEmail(), user.getId(), user.getRole().name());

            log.info("Token refreshed for user: {}", email);

            return buildAuthResponse(user, accessToken, newRefreshToken);

        } catch (ResourceNotFoundException e) {
            log.error("User not found during token refresh: {}", e.getMessage());
            throw new BadCredentialsException("Token refresh failed: " + e.getMessage());
        } catch (BadCredentialsException e) {
            log.error("Bad credentials during token refresh: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error refreshing token", e);
            throw new BadCredentialsException("Token refresh failed: " + e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        Date expirationDate = jwtTokenProvider.getExpirationDateFromToken(accessToken);
        LocalDateTime expiresAt = LocalDateTime
                .ofInstant(expirationDate.toInstant(), ZoneId.systemDefault());

        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setRegistrationStatus(user.getRegistrationStatus());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setEmailVerified(user.getEmailVerified());
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresAt(expiresAt);
        return response;
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        UserProfileResponse r = new UserProfileResponse();
        r.setId(user.getId());
        r.setFirstName(user.getFirstName());
        r.setLastName(user.getLastName());
        r.setFullName(user.getFullName());
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole());
        r.setRegistrationStatus(user.getRegistrationStatus());
        r.setProfilePictureUrl(user.getProfilePictureUrl());
        r.setEmailVerified(user.getEmailVerified());
        r.setIsActive(user.getIsActive());
        r.setCreatedAt(user.getCreatedAt());
        r.setLastLogin(user.getLastLogin());

        // Role specific details
        r.setFaculty(user.getFaculty());
        r.setDegreeProgram(user.getDegreeProgram());
        r.setYear(user.getYear());
        r.setSemester(user.getSemester());
        r.setStaffId(user.getStaffId());
        r.setDepartment(user.getDepartment());
        r.setDesignation(user.getDesignation());
        r.setSpecialization(user.getSpecialization());
        r.setAssignedLab(user.getAssignedLab());

        return r;
    }
}