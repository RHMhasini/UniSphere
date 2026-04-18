package com.unisphere.service.auth;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unisphere.dto.request.LoginRequest;
import com.unisphere.dto.request.ManualRegisterRequest;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthResponse loginManual(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse registerManual(ManualRegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadCredentialsException("Email already exists");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadCredentialsException("Passwords do not match");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        
        if (request.getRole() == UserRole.STUDENT) {
            user.setRegistrationStatus(RegistrationStatus.APPROVED);
            user.setIsActive(true); // Students do not need admin approval
        } else {
            user.setRegistrationStatus(RegistrationStatus.PENDING_APPROVAL);
            user.setIsActive(false); // Staff need admin approval
        }
        
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setGender(request.getGender());
        user.setStudentId(request.getStudentId());
        user.setFaculty(request.getFaculty());
        user.setDegreeProgram(request.getDegreeProgram());
        user.setYear(request.getYear());
        user.setSemester(request.getSemester());
        user.setStaffId(request.getStaffId());
        user.setTitle(request.getTitle());
        user.setDepartment(request.getDepartment());
        user.setDesignation(request.getDesignation());
        user.setSpecialization(request.getSpecialization());
        user.setAssignedLab(request.getAssignedLab());
        user.setOauthProvider("LOCAL");

        User savedUser = userRepository.save(user);

        // Notify admins regarding new registration
        try {
            notificationService.notifyAdminsNewRegistration(savedUser);
        } catch (Exception e) {
            log.error("Failed to notify admins about new registration: {}", e.getMessage());
        }

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole().name());

        return buildAuthResponse(savedUser, accessToken, refreshToken);
    }

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
                user.setStudentId(request.getStudentId());
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
    public UserProfileResponse updatePreferences(String email, java.util.Map<String, Boolean> preferences) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setNotificationPreferences(preferences);
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        log.info("Notification preferences updated for user: {}", email);
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
        
        if (request.getRole() == UserRole.STUDENT) {
            user.setRegistrationStatus(RegistrationStatus.APPROVED);
            user.setIsActive(true);
        } else {
            user.setRegistrationStatus(RegistrationStatus.PENDING_APPROVAL);
            user.setIsActive(false);
        }

        if (request.getProfilePictureUrl() != null && !request.getProfilePictureUrl().isEmpty()) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // FIX: Replaced if-else chain with switch expression
        switch (request.getRole()) {
            case STUDENT -> {
                user.setStudentId(request.getStudentId());
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

        try {
            notificationService.notifyUserAccountApproved(user);
        } catch (Exception e) {
            log.error("Failed to notify user of approval: {}", e.getMessage());
        }

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

        try {
            notificationService.notifyUserAccountRejected(user);
        } catch (Exception e) {
            log.error("Failed to notify user of rejection: {}", e.getMessage());
        }

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
    public UserProfileResponse updateUserStatus(String adminEmail, String userId, boolean isActive) {
        validateAdmin(adminEmail);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("Admin {} updated active status of {} to {}", adminEmail, user.getEmail(), isActive);

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
        response.setIsActive(user.getIsActive());
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
        r.setNotificationPreferences(user.getNotificationPreferences());

        // Role specific details
        r.setGender(user.getGender());
        r.setTitle(user.getTitle());
        r.setStudentId(user.getStudentId());
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