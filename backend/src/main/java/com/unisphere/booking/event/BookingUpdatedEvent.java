package com.unisphere.booking.event;

import com.unisphere.booking.model.Booking;
import org.springframework.context.ApplicationEvent;

public class BookingUpdatedEvent extends ApplicationEvent {

    private final Booking booking;

    public BookingUpdatedEvent(Object source, Booking booking) {
        super(source);
        this.booking = booking;
    }

    public Booking getBooking() {
        return booking;
    }
}
