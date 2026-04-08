package com.unisphere.service.impl;

import com.unisphere.dto.NotificationResponse;
import com.unisphere.entity.Notification;
import com.unisphere.enums.NotificationType;
import com.unisphere.repository.NotificationRepository;
import com.unisphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponse createNotification(String userId, String message, String notificationType) {
        // Validate enum
        try {
            NotificationType type = NotificationType.valueOf(notificationType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid notification type: " + notificationType +
                    ". Valid types are: STATUS_UPDATE, COMMENT, ASSIGNMENT, REJECTED"
            );
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(NotificationType.valueOf(notificationType))
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return mapToResponse(savedNotification);
    }

    @Override
    public List<NotificationResponse> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    @Override
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
