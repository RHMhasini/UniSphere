package com.unisphere.service.notification.listener;

import com.unisphere.event.ticket.*;
import com.unisphere.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleTicketCreated(TicketCreatedEvent event) {
        notificationService.notifyAdminsNewTicket(event.getTicket());
    }

    @EventListener
    public void handleTicketStatusChanged(TicketStatusChangedEvent event) {
        notificationService.notifyUserTicketStatusChange(event.getTicket(), event.getOldStatus(), event.getNewStatus());
    }

    @EventListener
    public void handleTicketAssigned(TicketAssignedEvent event) {
        notificationService.notifyTechnicianAssigned(event.getTicket(), event.getAssignedTo());
    }
}
