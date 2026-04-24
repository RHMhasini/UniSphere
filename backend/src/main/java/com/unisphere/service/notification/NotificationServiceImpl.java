package com.unisphere.service.notification;

import com.unisphere.dto.response.NotificationPageResponse;
import com.unisphere.dto.response.NotificationResponse;
import com.unisphere.dto.response.UnreadCountResponse;
import com.unisphere.entity.Notification;
import com.unisphere.entity.User;
import com.unisphere.entity.enums.UserRole;
import com.unisphere.exception.ResourceNotFoundException;
import com.unisphere.repository.NotificationRepository;
import com.unisphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void notifyAdminsNewRegistration(User applicant) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        if (admins.isEmpty()) {
            log.warn("No ADMIN users found; skipping registration notifications for {}", applicant.getEmail());
            return;
        }
        String message;
        if (applicant.getRole() == UserRole.STUDENT) {
            message = String.format(
                    "New student registered: %s (%s).",
                    applicant.getFullName(),
                    applicant.getEmail());
        } else {
            message = String.format(
                    "New registration pending approval: %s (%s) — role %s.",
                    applicant.getFullName(),
                    applicant.getEmail(),
                    applicant.getRole());
        }
        for (User admin : admins) {
            Map<String, Boolean> prefs = admin.getNotificationPreferences();
            if (prefs != null && prefs.containsKey("ADMIN_ALERTS") && !prefs.get("ADMIN_ALERTS")) {
                continue; // Admin opted out of registration alerts
            }
            
            Notification n = new Notification();
            n.setUserId(admin.getId());
            n.setMessage(message);
            n.setType("ADMIN_ALERTS");
            n.setRelatedUserId(applicant.getId());
            n.setIsRead(false);
            notificationRepository.save(n);
        }
        log.info("Notified {} admin(s) about pending registration {}", admins.size(), applicant.getEmail());
    }

    @Override
    public void notifyUserAccountApproved(User user) {
        Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs != null && prefs.containsKey("ACCOUNT_STATUS") && !prefs.get("ACCOUNT_STATUS")) {
            return;
        }
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage("Welcome! Your registration has been approved by the IT Admin.");
        n.setType("ACCOUNT_STATUS");
        n.setIsRead(false);
        notificationRepository.save(n);
        log.info("Approval notification created for {}", user.getEmail());
    }

    @Override
    public void notifyUserAccountRejected(User user) {
        Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs != null && prefs.containsKey("ACCOUNT_STATUS") && !prefs.get("ACCOUNT_STATUS")) {
            return;
        }
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage("Your registration was not approved. Please contact support for more details.");
        n.setType("ACCOUNT_STATUS");
        n.setIsRead(false);
        notificationRepository.save(n);
        log.info("Rejection notification created for {}", user.getEmail());
    }

    @Override
    public void notifyUserRegistrationSuccess(User user) {
        // Send a welcome notification to the student upon successful registration
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage(String.format("Welcome to UniSphere, %s! Your registration is complete. You can now book labs and report faults.", user.getFirstName()));
        n.setType("ACCOUNT_STATUS");
        n.setIsRead(false);
        notificationRepository.save(n);
        log.info("Registration success notification created for student: {}", user.getEmail());
    }

    @Override
    public void notifyAdminsNewBooking(com.unisphere.booking.model.Booking booking) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        if (admins.isEmpty()) {
            return;
        }
        String message = String.format("New booking request from %s for resource %s.", booking.getUserName(), booking.getResourceName());
        
        for (User admin : admins) {
            Map<String, Boolean> prefs = admin.getNotificationPreferences();
            if (prefs != null && prefs.containsKey("ADMIN_ALERTS") && !prefs.get("ADMIN_ALERTS")) {
                continue; 
            }
            
            Notification n = new Notification();
            n.setUserId(admin.getId());
            n.setMessage(message);
            n.setType("ADMIN_ALERTS");
            n.setRelatedUserId(booking.getUserId());
            n.setIsRead(false);
            notificationRepository.save(n);
        }
        log.info("Notified admins about new booking {}", booking.getId());
    }

    @Override
    public void notifyUserBookingApproved(com.unisphere.booking.model.Booking booking) {
        User user = userRepository.findById(booking.getUserId()).orElse(null);
        if (user == null) return;
        
        Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs != null && prefs.containsKey("BOOKING_UPDATES") && !prefs.get("BOOKING_UPDATES")) {
            return;
        }
        
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage(String.format("Your booking for %s has been APPROVED.", booking.getResourceName()));
        n.setType("BOOKING_UPDATES");
        n.setIsRead(false);
        notificationRepository.save(n);
        log.info("Booking approved notification created for {}", user.getEmail());
    }

    @Override
    public void notifyUserBookingRejected(com.unisphere.booking.model.Booking booking) {
        User user = userRepository.findById(booking.getUserId()).orElse(null);
        if (user == null) return;
        
        Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs != null && prefs.containsKey("BOOKING_UPDATES") && !prefs.get("BOOKING_UPDATES")) {
            return;
        }
        
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage(String.format("Your booking for %s has been REJECTED.", booking.getResourceName()));
        n.setType("BOOKING_UPDATES");
        n.setIsRead(false);
        notificationRepository.save(n);
        log.info("Booking rejected notification created for {}", user.getEmail());
    }

    @Override
    public NotificationPageResponse getNotifications(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Page<Notification> pg = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId(),
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt")));
        NotificationPageResponse out = new NotificationPageResponse();
        out.setContent(pg.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        out.setTotalElements(pg.getTotalElements());
        out.setTotalPages(pg.getTotalPages());
        out.setPage(pg.getNumber());
        out.setSize(pg.getSize());
        return out;
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId()).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UnreadCountResponse getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        long c = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return new UnreadCountResponse(c);
    }

    @Override
    public NotificationResponse markAsRead(String userEmail, String notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Notification n = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
        return toResponse(n);
    }

    @Override
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteAllForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.deleteByUserId(user.getId());
        log.info("Deleted all notifications for user {}", userEmail);
    }

    @Override
    public void deleteNotification(String userEmail, String notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (notificationRepository.findByIdAndUserId(notificationId, user.getId()).isEmpty()) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notificationRepository.deleteByIdAndUserId(notificationId, user.getId());
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setMessage(n.getMessage());
        r.setType(n.getType());
        r.setRelatedUserId(n.getRelatedUserId());
        r.setCreatedAt(n.getCreatedAt());
        r.setIsRead(n.getIsRead());
        return r;
    }
}
