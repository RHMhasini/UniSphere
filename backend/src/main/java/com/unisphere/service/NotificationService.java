package com.unisphere.service;

import com.unisphere.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse createNotification(String userId, String message, String notificationType);
    List<NotificationResponse> getNotificationsByUserId(String userId);
    List<NotificationResponse> getUnreadNotifications(String userId);
    NotificationResponse markAsRead(String notificationId);
    void deleteNotification(String notificationId);
}
