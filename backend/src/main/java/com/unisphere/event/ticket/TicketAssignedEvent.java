package com.unisphere.event.ticket;

import com.unisphere.entity.Ticket;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketAssignedEvent extends ApplicationEvent {
    private final Ticket ticket;
    private final String assignedTo;

    public TicketAssignedEvent(Object source, Ticket ticket, String assignedTo) {
        super(source);
        this.ticket = ticket;
        this.assignedTo = assignedTo;
    }
}
