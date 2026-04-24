package com.unisphere.event.ticket;

import com.unisphere.entity.Ticket;
import com.unisphere.enums.TicketStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketStatusChangedEvent extends ApplicationEvent {
    private final Ticket ticket;
    private final TicketStatus oldStatus;
    private final TicketStatus newStatus;

    public TicketStatusChangedEvent(Object source, Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus) {
        super(source);
        this.ticket = ticket;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
