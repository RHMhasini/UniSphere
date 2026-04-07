package com.unisphere.booking.event;

import com.unisphere.booking.model.BookingStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingStatusChangedEvent extends ApplicationEvent {

    private final String bookingId;
    private final String userId;
    private final BookingStatus oldStatus;
    private final BookingStatus newStatus;

    public BookingStatusChangedEvent(Object source, String bookingId, String userId, BookingStatus oldStatus, BookingStatus newStatus) {
        super(source);
        this.bookingId = bookingId;
        this.userId = userId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
