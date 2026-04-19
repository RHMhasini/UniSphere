package com.unisphere.service.impl;

import com.unisphere.dto.*;
import com.unisphere.entity.Ticket;
import com.unisphere.entity.TicketHistory;
import com.unisphere.enums.Category;
import com.unisphere.enums.NotificationType;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;
import com.unisphere.exception.ResourceNotFoundException;
import com.unisphere.repository.TicketHistoryRepository;
import com.unisphere.repository.TicketRepository;
import com.unisphere.service.NotificationService;
import com.unisphere.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final NotificationService notificationService;

    // ── Create ─────────────────────────────────────────────────────────────────

    @Override
    public TicketResponse createTicket(CreateTicketRequest req) {
        validateAttachments(req.getAttachments());

        Ticket ticket = Ticket.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(req.getPriority())
                .status(TicketStatus.OPEN)
                .createdBy(req.getCreatedBy())
                .assignedTo(req.getAssignedTo())
                .location(req.getLocation())
                .contactEmail(req.getContactEmail())
                .contactPhone(req.getContactPhone())
                .attachments(req.getAttachments() != null ? req.getAttachments() : new ArrayList<>())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Audit entry
        saveHistory(saved.getId(), null, TicketStatus.OPEN, req.getCreatedBy());

        // Notify the submitter
        notificationService.createNotification(
                saved.getCreatedBy(),
                "Your ticket \"" + saved.getTitle() + "\" has been submitted (OPEN).",
                NotificationType.STATUS_UPDATE.name()
        );

        // Notify assigned technician if already assigned
        if (saved.getAssignedTo() != null && !saved.getAssignedTo().isBlank()) {
            notificationService.createNotification(
                    saved.getAssignedTo(),
                    "You have been assigned a new ticket: \"" + saved.getTitle() + "\".",
                    NotificationType.ASSIGNMENT.name()
            );
        }

        return mapToResponse(saved);
    }

    // ── Read ───────────────────────────────────────────────────────────────────

    @Override
    public TicketResponse getTicketById(String id) {
        Ticket ticket = findOrThrow(id);

        // --- Role Security (Backend Side) ---
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String email = auth.getName();
            String role = auth.getAuthorities().iterator().next().getAuthority();

            boolean isStaff = "ADMIN".equals(role) || "TECHNICIAN".equals(role);
            boolean isCreator = ticket.getCreatedBy().equals(email);
            boolean isPublic = ticket.getCategory() == Category.FACILITY;

            if (!isStaff && !isCreator && !isPublic) {
                throw new com.unisphere.exception.UnauthorizedAccessException(
                    "Access Denied: You do not have permission to view this ticket."
                );
            }
        }

        return mapToResponse(ticket);
    }

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Update metadata (PATCH) ────────────────────────────────────────────────

    @Override
    public TicketResponse updateTicket(String id, UpdateTicketRequest req) {
        Ticket ticket = findOrThrow(id);

        if (req.getTitle() != null)        ticket.setTitle(req.getTitle());
        if (req.getDescription() != null)  ticket.setDescription(req.getDescription());
        if (req.getCategory() != null)     ticket.setCategory(req.getCategory());
        if (req.getPriority() != null)     ticket.setPriority(req.getPriority());
        if (req.getLocation() != null)     ticket.setLocation(req.getLocation());
        if (req.getContactEmail() != null) ticket.setContactEmail(req.getContactEmail());
        if (req.getContactPhone() != null) ticket.setContactPhone(req.getContactPhone());
        if (req.getAttachments() != null)  ticket.setAttachments(req.getAttachments());

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    @Override
    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found: " + id);
        }
        ticketRepository.deleteById(id);
    }

    // ── Status workflow ────────────────────────────────────────────────────────

    @Override
    public TicketResponse updateTicketStatus(String id, UpdateTicketStatusRequest req) {
        Ticket ticket = findOrThrow(id);

        if (req.getNewStatus() == null) {
            throw new IllegalArgumentException("newStatus is required");
        }

        // --- Role Validation ---
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String role = (auth != null && !auth.getAuthorities().isEmpty()) 
                ? auth.getAuthorities().iterator().next().getAuthority() 
                : "STUDENT";

        validateStatusTransition(role, ticket.getStatus(), req.getNewStatus());

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(req.getNewStatus());

        if (req.getResolutionNote() != null) {
            ticket.setResolutionNote(req.getResolutionNote());
        }
        if (req.getRejectionReason() != null) {
            ticket.setRejectionReason(req.getRejectionReason());
        }

        Ticket updated = ticketRepository.save(ticket);

        // Audit
        String changedBy = (auth != null) ? auth.getName() : (req.getChangedBy() != null ? req.getChangedBy() : "system");
        saveHistory(id, oldStatus, req.getNewStatus(), changedBy);

        // Notify ticket creator of status change
        notificationService.createNotification(
                updated.getCreatedBy(),
                String.format("Ticket \"%s\" status changed from %s to %s.", updated.getTitle(), oldStatus, req.getNewStatus()),
                req.getNewStatus() == TicketStatus.REJECTED
                        ? NotificationType.REJECTED.name()
                        : NotificationType.STATUS_UPDATE.name()
        );

        return mapToResponse(updated);
    }

    // ── Assign technician ──────────────────────────────────────────────────────

    @Override
    public TicketResponse assignTicket(String id, AssignTicketRequest req) {
        Ticket ticket = findOrThrow(id);

        ticket.setAssignedTo(req.getAssignedTo());
        Ticket updated = ticketRepository.save(ticket);

        // Notify technician
        notificationService.createNotification(
                req.getAssignedTo(),
                "You have been assigned to ticket: \"" + updated.getTitle() + "\".",
                NotificationType.ASSIGNMENT.name()
        );

        return mapToResponse(updated);
    }

    // ── Filtering ──────────────────────────────────────────────────────────────

    @Override
    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByCategory(Category category) {
        return ticketRepository.findByCategory(category).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByPriority(TicketPriority priority) {
        return ticketRepository.findByPriority(priority).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByCreatedBy(String createdBy) {
        return ticketRepository.findByCreatedBy(createdBy).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsAssignedTo(String assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Multi-param filter (all params optional).
     * Falls back to fetching all and filtering in memory when multiple criteria
     * are combined (avoids building a complex @Query for now).
     */
    @Override
    public List<TicketResponse> filterTickets(TicketStatus status, Category category,
                                              TicketPriority priority, String createdBy, String assignedTo) {
        // Core logic: if specific filters are provided, we use them.
        // But the Controller will now call getTicketsForUser for the main dashboard view.
        List<Ticket> result;
        if (status != null && category != null) {
            result = ticketRepository.findByStatusAndCategory(status, category);
        } else if (status != null && priority != null) {
            result = ticketRepository.findByStatusAndPriority(status, priority);
        } else if (status != null && createdBy != null) {
            result = ticketRepository.findByCreatedByAndStatus(createdBy, status);
        } else if (status != null && assignedTo != null) {
            result = ticketRepository.findByAssignedToAndStatus(assignedTo, status);
        } else if (status != null) {
            result = ticketRepository.findByStatus(status);
        } else if (category != null) {
            result = ticketRepository.findByCategory(category);
        } else if (priority != null) {
            result = ticketRepository.findByPriority(priority);
        } else if (createdBy != null) {
            result = ticketRepository.findByCreatedBy(createdBy);
        } else if (assignedTo != null) {
            result = ticketRepository.findByAssignedTo(assignedTo);
        } else {
            result = ticketRepository.findAll();
        }
        return result.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsForUser(String email, String role) {
        List<Ticket> tickets;
        if ("ADMIN".equals(role)) {
            tickets = ticketRepository.findAll();
        } else if ("TECHNICIAN".equals(role)) {
            tickets = ticketRepository.findByAssignedTo(email);
        } else {
            // STUDENT / LECTURER / OTHERS
            tickets = ticketRepository.findByCreatedBy(email);
        }
        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── History ────────────────────────────────────────────────────────────────

    @Override
    public List<TicketHistoryResponse> getTicketHistory(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found: " + ticketId);
        }
        return ticketHistoryRepository.findByTicketId(ticketId).stream()
                .map(h -> TicketHistoryResponse.builder()
                        .id(h.getId())
                        .ticketId(h.getTicketId())
                        .oldStatus(h.getOldStatus())
                        .newStatus(h.getNewStatus())
                        .changedBy(h.getChangedBy())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Stats ──────────────────────────────────────────────────────────────────

    @Override
    public Map<String, Long> getStatusCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (TicketStatus s : TicketStatus.values()) {
            counts.put(s.name(), ticketRepository.countByStatus(s));
        }
        return counts;
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private Ticket findOrThrow(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private void saveHistory(String ticketId, TicketStatus oldStatus, TicketStatus newStatus, String changedBy) {
        TicketHistory history = TicketHistory.builder()
                .ticketId(ticketId)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .build();
        ticketHistoryRepository.save(history);
    }

    private TicketResponse mapToResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .createdBy(t.getCreatedBy())
                .assignedTo(t.getAssignedTo())
                .location(t.getLocation())
                .contactEmail(t.getContactEmail())
                .contactPhone(t.getContactPhone())
                .attachments(t.getAttachments())
                .resolutionNote(t.getResolutionNote())
                .rejectionReason(t.getRejectionReason())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private void validateStatusTransition(String role, TicketStatus currentStatus, TicketStatus newStatus) {
        if (currentStatus == newStatus) return;

        // 1. Strict Workflow State Machine logic
        boolean isValidTransition = switch (currentStatus) {
            case OPEN -> newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.REJECTED;
            case IN_PROGRESS -> newStatus == TicketStatus.RESOLVED;
            case RESOLVED -> newStatus == TicketStatus.CLOSED;
            case REJECTED, CLOSED -> false; // Final states
        };

        if (!isValidTransition) {
            throw new IllegalArgumentException(
                String.format("Invalid workflow transition: Cannot move from %s to %s.", currentStatus, newStatus)
            );
        }

        // 2. Role Security enforcement (Backend)
        if ("ADMIN".equals(role)) return;

        if ("TECHNICIAN".equals(role)) {
            // Technicians can only move to IN_PROGRESS or RESOLVED
            if (newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.RESOLVED) {
                return;
            }
            throw new com.unisphere.exception.UnauthorizedAccessException(
                "Technicians are only permitted to mark tickets as IN_PROGRESS or RESOLVED."
            );
        }

        throw new com.unisphere.exception.UnauthorizedAccessException(
            "Security Alert: Your role does not have permission to modify ticket status."
        );
    }

    private void validateAttachments(List<String> attachments) {
        if (attachments == null || attachments.isEmpty()) return;

        // Requirement: Limit = 3
        if (attachments.size() > 3) {
            throw new IllegalArgumentException("Attachment limit exceeded: Maximum 3 images allowed.");
        }

        for (String att : attachments) {
            // Validate File Type (for extra marks)
            if (!att.startsWith("data:image/")) {
                throw new IllegalArgumentException("Invalid file type: Only images (JPG, PNG) are allowed.");
            }
            // Mock File Size validation (~5MB base64)
            if (att.length() > 5 * 1024 * 1024 * 1.33) {
                throw new IllegalArgumentException("File too large: Each attachment must be under 5MB.");
            }
        }
    }
}
