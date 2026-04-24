package com.unisphere.service.notification;

import com.unisphere.dto.response.NotificationPageResponse;
import com.unisphere.dto.response.NotificationResponse;
import com.unisphere.dto.response.UnreadCountResponse;
import com.unisphere.entity.User;

import java.util.List;

public interface NotificationService {

    void notifyAdminsNewRegistration(User applicant);

    void notifyUserAccountApproved(User user);

    void notifyUserAccountRejected(User user);

    void notifyUserRegistrationSuccess(User user);

    void notifyAdminsNewBooking(com.unisphere.booking.model.Booking booking);

    void notifyUserBookingApproved(com.unisphere.booking.model.Booking booking);

    void notifyUserBookingRejected(com.unisphere.booking.model.Booking booking);

    void notifyAdminsBookingUpdated(com.unisphere.booking.model.Booking booking);

    void notifyAdminsBookingCancelled(com.unisphere.booking.model.Booking booking);

    void notifyUserBookingReminder(com.unisphere.booking.model.Booking booking);

    void notifyAdminBookingReminder(com.unisphere.booking.model.Booking booking);

    void notifyAdminsNewTicket(com.unisphere.entity.Ticket ticket);

    void notifyUserTicketStatusChange(com.unisphere.entity.Ticket ticket, com.unisphere.enums.TicketStatus oldStatus, com.unisphere.enums.TicketStatus newStatus);

    void notifyTechnicianAssigned(com.unisphere.entity.Ticket ticket, String assignedTo);

    NotificationPageResponse getNotifications(String userEmail, int page, int size);

    List<NotificationResponse> getUnreadNotifications(String userEmail);

    UnreadCountResponse getUnreadCount(String userEmail);

    NotificationResponse markAsRead(String userEmail, String notificationId);

    void markAllAsRead(String userEmail);

    void deleteAllForUser(String userEmail);

    void deleteNotification(String userEmail, String notificationId);
}
