package com.unisphere.service.notification.listener;

import com.unisphere.booking.event.BookingCreatedEvent;
import com.unisphere.booking.event.BookingStatusChangedEvent;
import com.unisphere.booking.model.BookingStatus;
import com.unisphere.service.notification.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BookingEventListener {

    private static final Logger log = LoggerFactory.getLogger(BookingEventListener.class);

    @Autowired
    private NotificationService notificationService;

    @EventListener
    public void handleBookingCreated(BookingCreatedEvent event) {
        log.info("Received BookingCreatedEvent for booking ID: {}", event.getBooking().getId());
        notificationService.notifyAdminsNewBooking(event.getBooking());
    }

    @EventListener
    public void handleBookingStatusChanged(BookingStatusChangedEvent event) {
        log.info("Received BookingStatusChangedEvent for booking ID: {}", event.getBooking().getId());
        
        if (event.getBooking().getStatus() == BookingStatus.APPROVED) {
            notificationService.notifyUserBookingApproved(event.getBooking());
        } else if (event.getBooking().getStatus() == BookingStatus.REJECTED) {
            notificationService.notifyUserBookingRejected(event.getBooking());
        }
    }
}
