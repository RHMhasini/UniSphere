package com.unisphere.service.impl;

import com.unisphere.dto.CreateTicketRequest;
import com.unisphere.dto.TicketResponse;
import com.unisphere.dto.UpdateTicketStatusRequest;
import com.unisphere.entity.Ticket;
import com.unisphere.entity.TicketHistory;
import com.unisphere.enums.NotificationType;
import com.unisphere.enums.TicketStatus;
import com.unisphere.repository.TicketHistoryRepository;
import com.unisphere.repository.TicketRepository;
import com.unisphere.service.NotificationService;
import com.unisphere.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {
    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final NotificationService notificationService;

    private static final String DEFAULT_USER = "user123";
    private static final String DEFAULT_TECH = "tech123";

    @Override
    public TicketResponse createTicket(CreateTicketRequest request) {
        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .createdBy(DEFAULT_USER)
                .assignedTo(DEFAULT_TECH)
                .location(request.getLocation())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .attachments(request.getAttachments())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        // Create initial history record
        TicketHistory history = TicketHistory.builder()
                .ticketId(savedTicket.getId())
                .oldStatus(null)
                .newStatus(TicketStatus.OPEN)
                .changedBy(DEFAULT_TECH)
                .changedAt(LocalDateTime.now())
                .build();
        ticketHistoryRepository.save(history);

        return mapToResponse(savedTicket);
    }

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponse getTicketById(String id) {
        return ticketRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    @Override
    public TicketResponse updateTicketStatus(String id, UpdateTicketStatusRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getNewStatus());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updatedTicket = ticketRepository.save(ticket);

        // Record status change in history
        TicketHistory history = TicketHistory.builder()
                .ticketId(id)
                .oldStatus(oldStatus)
                .newStatus(request.getNewStatus())
                .changedBy(DEFAULT_TECH)
                .changedAt(LocalDateTime.now())
                .build();
        ticketHistoryRepository.save(history);

        // Create notification for status change
        String notificationMessage = String.format(
                "Ticket #%s status changed from %s to %s",
                id, oldStatus, request.getNewStatus()
        );
        notificationService.createNotification(
                ticket.getCreatedBy(),
                notificationMessage,
                NotificationType.STATUS_UPDATE.toString()
        );

        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponse assignTicket(String id, String assignedTo) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        ticket.setAssignedTo(assignedTo);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updatedTicket = ticketRepository.save(ticket);

        // Create notification for assignment
        String notificationMessage = String.format(
                "You have been assigned to ticket #%s: %s",
                id, ticket.getTitle()
        );
        notificationService.createNotification(
                assignedTo,
                notificationMessage,
                NotificationType.ASSIGNMENT.toString()
        );

        return mapToResponse(updatedTicket);
    }

    @Override
    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }

    @Override
    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByCreatedBy(String createdBy) {
        return ticketRepository.findByCreatedBy(createdBy).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsAssignedTo(String assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdBy(ticket.getCreatedBy())
                .assignedTo(ticket.getAssignedTo())
                .location(ticket.getLocation())
                .contactEmail(ticket.getContactEmail())
                .contactPhone(ticket.getContactPhone())
                .attachments(ticket.getAttachments())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
