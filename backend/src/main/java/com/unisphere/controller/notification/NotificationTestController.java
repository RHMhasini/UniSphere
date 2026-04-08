package com.unisphere.controller.notification;

import com.unisphere.entity.Notification;
import com.unisphere.repository.NotificationRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Test Controller for Notifications Module
 * Member 04: Trigger Database Creation in Atlas
 */
@RestController
@RequestMapping("/notifications")
public class NotificationTestController {

    private final NotificationRepository notificationRepository;
    private final com.unisphere.repository.UserRepository userRepository;

    public NotificationTestController(NotificationRepository notificationRepository, com.unisphere.repository.UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Test endpoint to save a dummy notification
     * Access via: POST http://localhost:8081/api/notifications/test
     * Note: RequestBody is now optional to avoid HttpMessageNotReadableException
     */
    @PostMapping("/test")
    public Notification saveTestNotification(@RequestBody(required = false) Map<String, String> payload) {
        String email = (payload != null) ? payload.getOrDefault("userId", "member_04_test") : "member_04_test";
        String message = (payload != null) ? payload.getOrDefault("message", "Smart Campus Operations Hub - Verified Connection") : "Smart Campus Operations Hub - Verified Connection";
        String type = (payload != null) ? payload.getOrDefault("type", "SYSTEM") : "SYSTEM";

        String actualUserId = email;
        com.unisphere.entity.User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            actualUserId = user.getId();
            
            // Check Notification Preferences before saving!
            Map<String, Boolean> prefs = user.getNotificationPreferences();
            if (prefs != null && prefs.containsKey(type) && !prefs.get(type)) {
                // Return a mock notification indicating it was skipped due to preferences
                Notification skipped = new Notification();
                skipped.setMessage("SKIPPED: User has disabled " + type + " notifications.");
                return skipped;
            }
        }

        Notification notification = new Notification();
        notification.setUserId(actualUserId);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }
}
