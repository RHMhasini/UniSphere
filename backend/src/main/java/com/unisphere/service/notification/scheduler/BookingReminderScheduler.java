package com.unisphere.service.notification.scheduler;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.BookingStatus;
import com.unisphere.booking.repository.BookingRepository;
import com.unisphere.service.notification.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class BookingReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingReminderScheduler.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Runs every day at 8:00 AM to send reminders for today's bookings.
     * Cron format: second, minute, hour, day, month, day-of-week
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyBookingReminders() {
        log.info("Starting scheduled task: sendDailyBookingReminders");

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<Booking> todaysBookings = bookingRepository.findByStatusAndReminderSentFalseAndStartTimeBetween(
                BookingStatus.APPROVED, startOfDay, endOfDay);

        if (todaysBookings.isEmpty()) {
            log.info("No approved bookings found for today requiring reminders.");
            return;
        }

        for (Booking booking : todaysBookings) {
            try {
                // Notify User
                notificationService.notifyUserBookingReminder(booking);
                
                // Notify Admins
                notificationService.notifyAdminBookingReminder(booking);

                // Mark as sent
                booking.setReminderSent(true);
                bookingRepository.save(booking);
                
            } catch (Exception e) {
                log.error("Failed to send reminder for booking ID: {}", booking.getId(), e);
            }
        }

        log.info("Scheduled task finished. Sent {} reminders.", todaysBookings.size());
    }
}
