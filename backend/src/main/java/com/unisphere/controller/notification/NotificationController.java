package com.unisphere.controller.notification;

import com.unisphere.dto.response.ApiResponse;
import com.unisphere.dto.response.NotificationPageResponse;
import com.unisphere.dto.response.NotificationResponse;
import com.unisphere.dto.response.UnreadCountResponse;
import com.unisphere.service.notification.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            NotificationPageResponse data = notificationService.getNotifications(email, page, size);
            return ResponseEntity.ok(ApiResponse.success(data, "Notifications retrieved"));
        } catch (Exception e) {
            log.error("getNotifications failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load notifications"));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            List<NotificationResponse> list = notificationService.getUnreadNotifications(email);
            return ResponseEntity.ok(ApiResponse.success(list, "Unread notifications retrieved"));
        } catch (Exception e) {
            log.error("getUnreadNotifications failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load unread notifications"));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UnreadCountResponse data = notificationService.getUnreadCount(email);
            return ResponseEntity.ok(ApiResponse.success(data, "Unread count retrieved"));
        } catch (Exception e) {
            log.error("getUnreadCount failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load unread count"));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable("id") String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            NotificationResponse updated = notificationService.markAsRead(email, id);
            return ResponseEntity.ok(ApiResponse.success(updated, "Notification marked as read"));
        } catch (Exception e) {
            log.error("markAsRead failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to mark notification"));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            notificationService.markAllAsRead(email);
            return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
        } catch (Exception e) {
            log.error("markAllAsRead failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to mark all as read"));
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAll() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            notificationService.deleteAllForUser(email);
            return ResponseEntity.ok(ApiResponse.success(null, "All notifications cleared"));
        } catch (Exception e) {
            log.error("deleteAll notifications failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to clear notifications"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOne(@PathVariable("id") String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            notificationService.deleteNotification(email, id);
            return ResponseEntity.ok(ApiResponse.success(null, "Notification removed"));
        } catch (Exception e) {
            log.error("deleteNotification failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to remove notification"));
        }
    }
}
