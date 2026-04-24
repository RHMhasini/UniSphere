package com.unisphere.booking.listener;

import com.unisphere.booking.event.BookingStatusChangedEvent;
import com.unisphere.booking.event.BookingCreatedEvent;
import com.unisphere.booking.model.Booking;
import com.unisphere.booking.repository.BookingRepository;
import com.unisphere.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingEventListener {

    private final NotificationService notificationService;
    private final BookingRepository bookingRepository;

    @EventListener
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        Booking booking = bookingRepository.findById(event.getBookingId()).orElse(null);
        if (booking == null) return;

        notificationService.notifyUserBookingStatusChanged(
                booking.getUserId(),
                booking.getResourceName(),
                booking.getStatus().name(),
                booking.getAdminReason()
        );
    }

    @EventListener
    public void onBookingCreated(BookingCreatedEvent event) {
        Booking booking = event.getBooking();
        notificationService.notifyAdminsNewBooking(
                booking.getUserName() != null ? booking.getUserName() : booking.getUserId(),
                booking.getResourceName()
        );
    }
}
