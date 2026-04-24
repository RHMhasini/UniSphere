package com.unisphere.booking.event;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.BookingStatus;
import org.springframework.context.ApplicationEvent;

public class BookingStatusChangedEvent extends ApplicationEvent {

    private final Booking booking;
    private final BookingStatus previousStatus;

    public BookingStatusChangedEvent(Object source, Booking booking, BookingStatus previousStatus) {
        super(source);
        this.booking = booking;
        this.previousStatus = previousStatus;
    }

    public Booking getBooking() {
        return booking;
    }

    public BookingStatus getPreviousStatus() {
        return previousStatus;
    }
}
