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
import com.unisphere.repository.UserRepository;
import com.unisphere.service.notification.NotificationService;
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
    private final UserRepository userRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    // ── Create ─────────────────────────────────────────────────────────────────

    @Override
    public TicketResponse createTicket(CreateTicketRequest req) {
        validateAttachments(req.getAttachments());

        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String actorEmail = (auth != null && auth.getName() != null && !auth.getName().isBlank()) ? auth.getName() : null;

        // Prefer authenticated user (from X-User-Email) to avoid spoofing during the mock-auth phase.
        String createdBy = (actorEmail != null) ? actorEmail : req.getCreatedBy();
        if (createdBy == null || createdBy.isBlank()) {
            throw new IllegalArgumentException("createdBy is required (or provide X-User-Email header)");
        }

        // Priority restricted to ADMIN only. Non-admins default to LOW.
        TicketPriority finalPriority = req.getPriority();

        // Extract role from auth or headers (consistent with status update logic)
        String role = (auth != null && !auth.getAuthorities().isEmpty())
                ? auth.getAuthorities().iterator().next().getAuthority()
                : "ROLE_STUDENT";

        if (!"ROLE_ADMIN".equals(role)) {
            finalPriority = TicketPriority.LOW;
        }

        Ticket ticket = Ticket.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(finalPriority)
                .status(TicketStatus.OPEN)
                .createdBy(createdBy)
                .assignedTo(req.getAssignedTo())
                .location(req.getLocation())
                .contactEmail(req.getContactEmail())
                .contactPhone(req.getContactPhone())
                .attachments(req.getAttachments() != null ? req.getAttachments() : new ArrayList<>())
                .deletedByStudent(false)
                .deletedByTechnician(false)
                .isArchived(false)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Audit entry
        saveHistory(saved.getId(), null, TicketStatus.OPEN, createdBy);

        // Publish event for notifications
        eventPublisher.publishEvent(new com.unisphere.event.ticket.TicketCreatedEvent(this, saved));

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

            if (Boolean.TRUE.equals(ticket.getIsArchived()) && !"ROLE_ADMIN".equals(role)) {
                throw new ResourceNotFoundException("Ticket not found: " + id);
            }

            Set<String> actorIds = resolveActorIdentifiers(email);
            boolean isCreator = actorIds.contains(ticket.getCreatedBy());

            if (Boolean.TRUE.equals(ticket.getDeletedByStudent())
                    && ("ROLE_STUDENT".equals(role) || "ROLE_LECTURER".equals(role))
                    && isCreator) {
                throw new ResourceNotFoundException("Ticket not found: " + id);
            }

            boolean isStaff = "ROLE_ADMIN".equals(role) || "ROLE_TECHNICIAN".equals(role);
            boolean isAssignee = ticket.getAssignedTo() != null && actorIds.contains(ticket.getAssignedTo());
            boolean isPublic = ticket.getCategory() == Category.FACILITY;

            // Technicians should only access assigned tickets (unless it's public FACILITY)
            if ("ROLE_TECHNICIAN".equals(role) && !isAssignee && !isPublic) {
                throw new com.unisphere.exception.UnauthorizedAccessException(
                        "Access Denied: You do not have permission to view this ticket."
                );
            }

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
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Update metadata (PATCH) ────────────────────────────────────────────────

    @Override
    public TicketResponse updateTicket(String id, UpdateTicketRequest req) {
        Ticket ticket = findOrThrow(id);

        if (req.getPriority() != null) {
            TicketStatus st = ticket.getStatus();
            if (st == TicketStatus.RESOLVED || st == TicketStatus.CLOSED || st == TicketStatus.REJECTED) {
                throw new IllegalArgumentException(
                        "Priority cannot be changed after a ticket is resolved, closed, or rejected.");
            }
        }

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
        Ticket ticket = findOrThrow(id);

        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank() || auth.getAuthorities().isEmpty()) {
            throw new com.unisphere.exception.UnauthorizedAccessException("Authentication required to delete or archive tickets.");
        }

        String email = auth.getName();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        Set<String> actorIds = resolveActorIdentifiers(email);

        if ("ROLE_TECHNICIAN".equals(role)) {
            throw new com.unisphere.exception.UnauthorizedAccessException(
                    "Technicians cannot delete or archive tickets.");
        }

        if ("ROLE_ADMIN".equals(role)) {
            ticket.setIsArchived(true);
            ticketRepository.save(ticket);
            return;
        }

        if (!"ROLE_STUDENT".equals(role) && !"ROLE_LECTURER".equals(role)) {
            throw new com.unisphere.exception.UnauthorizedAccessException(
                    "You do not have permission to remove this ticket.");
        }

        if (!actorIds.contains(ticket.getCreatedBy())) {
            throw new com.unisphere.exception.UnauthorizedAccessException(
                    "You can only remove tickets that you created.");
        }

        ticket.setDeletedByStudent(true);
        ticketRepository.save(ticket);
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
                : "ROLE_STUDENT";

        validateStatusTransition(role, ticket.getStatus(), req.getNewStatus());

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = req.getNewStatus();

        if (newStatus == TicketStatus.RESOLVED && (req.getResolutionNote() == null || req.getResolutionNote().isBlank())) {
            throw new IllegalArgumentException("A resolution note is required to mark a ticket as RESOLVED.");
        }
        if (newStatus == TicketStatus.REJECTED && (req.getRejectionReason() == null || req.getRejectionReason().isBlank())) {
            throw new IllegalArgumentException("A rejection reason is required to mark a ticket as REJECTED.");
        }

        ticket.setStatus(newStatus);

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

        // Publish event for notifications
        eventPublisher.publishEvent(new com.unisphere.event.ticket.TicketStatusChangedEvent(this, updated, oldStatus, req.getNewStatus()));

        return mapToResponse(updated);
    }

    // ── Assign technician ──────────────────────────────────────────────────────

    @Override
    public TicketResponse assignTicket(String id, AssignTicketRequest req) {
        Ticket ticket = findOrThrow(id);

        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String role = (auth != null && !auth.getAuthorities().isEmpty())
                ? auth.getAuthorities().iterator().next().getAuthority()
                : "ROLE_STUDENT";

        if (!"ROLE_ADMIN".equals(role)) {
            throw new com.unisphere.exception.UnauthorizedAccessException(
                    "Only ADMIN users can assign technicians to tickets."
            );
        }

        if (ticket.getStatus() != TicketStatus.OPEN && ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new IllegalArgumentException(
                    "Technicians can only be assigned to OPEN or IN_PROGRESS tickets."
            );
        }

        ticket.setAssignedTo(req.getAssignedTo());
        Ticket updated = ticketRepository.save(ticket);

        // Publish event for notifications
        eventPublisher.publishEvent(new com.unisphere.event.ticket.TicketAssignedEvent(this, updated, req.getAssignedTo()));

        return mapToResponse(updated);
    }

    // ── Filtering ──────────────────────────────────────────────────────────────

    @Override
    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByCategory(Category category) {
        return ticketRepository.findByCategory(category).stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByPriority(TicketPriority priority) {
        return ticketRepository.findByPriority(priority).stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByCreatedBy(String createdBy) {
        return ticketRepository.findByCreatedBy(createdBy).stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .filter(t -> !Boolean.TRUE.equals(t.getDeletedByStudent()))
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsAssignedTo(String assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo).stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
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
        // Keep implementation simple and correct: fetch + apply all provided criteria.
        // (Small dataset in this module; avoids a complex repository query matrix.)
        return ticketRepository.findAll().stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> category == null || t.getCategory() == category)
                .filter(t -> priority == null || t.getPriority() == priority)
                .filter(t -> createdBy == null || createdBy.isBlank() || createdBy.equals(t.getCreatedBy()))
                .filter(t -> assignedTo == null || assignedTo.isBlank() || assignedTo.equals(t.getAssignedTo()))
                .filter(t -> {
                    if (createdBy != null && !createdBy.isBlank()) {
                        return !Boolean.TRUE.equals(t.getDeletedByStudent());
                    }
                    return true;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsForUser(String email, String role) {
        if ("ROLE_ADMIN".equals(role)) {
            return ticketRepository.findAll().stream()
                    .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        Set<String> actorIds = resolveActorIdentifiers(email);

        return ticketRepository.findAll().stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsArchived()))
                .filter(t -> {
                    if ("ROLE_TECHNICIAN".equals(role)) {
                        return t.getAssignedTo() != null && actorIds.contains(t.getAssignedTo());
                    }
                    return t.getCreatedBy() != null && actorIds.contains(t.getCreatedBy())
                            && !Boolean.TRUE.equals(t.getDeletedByStudent());
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
            long c = ticketRepository.findAll().stream()
                    .filter(t -> t.getStatus() == s && !Boolean.TRUE.equals(t.getIsArchived()))
                    .count();
            counts.put(s.name(), c);
        }
        return counts;
    }

    @Override
    public List<TicketResponse> getFullTicketRegisterForAdmin() {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null || auth.getAuthorities().isEmpty()) {
            throw new com.unisphere.exception.UnauthorizedAccessException("Authentication required.");
        }
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!"ROLE_ADMIN".equals(role)) {
            throw new com.unisphere.exception.UnauthorizedAccessException(
                    "Only administrators can export the full ticket register.");
        }
        return ticketRepository.findAll().stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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

    /**
     * During the "mock auth header" phase, identity may be stored as either email or seeded user id (u1001...).
     * This helper makes the system compatible with both so existing DB data keeps working.
     */
    private Set<String> resolveActorIdentifiers(String email) {
        Set<String> ids = new LinkedHashSet<>();
        if (email != null && !email.isBlank()) {
            ids.add(email);
            userRepository.findByEmail(email).ifPresent(u -> {
                if (u.getId() != null && !u.getId().isBlank()) ids.add(u.getId());
            });
        }
        return ids;
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
                .deletedByStudent(t.getDeletedByStudent())
                .deletedByTechnician(t.getDeletedByTechnician())
                .isArchived(t.getIsArchived())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private void validateStatusTransition(String role, TicketStatus currentStatus, TicketStatus newStatus) {
        if (currentStatus == newStatus) return;

        // 1. Strict Workflow State Machine logic
        boolean isValidTransition;

        // Special case: REJECTED can happen from any non-final state (admin-only enforced below)
        if (newStatus == TicketStatus.REJECTED) {
            isValidTransition = currentStatus != TicketStatus.CLOSED && currentStatus != TicketStatus.REJECTED;
        } else {
            isValidTransition = switch (currentStatus) {
                case OPEN -> newStatus == TicketStatus.IN_PROGRESS;
                case IN_PROGRESS -> newStatus == TicketStatus.RESOLVED;
                case RESOLVED -> newStatus == TicketStatus.CLOSED;
                case REJECTED, CLOSED -> false; // Final states
            };
        }

        if (!isValidTransition) {
            throw new IllegalArgumentException(
                String.format("Invalid workflow transition: Cannot move from %s to %s.", currentStatus, newStatus)
            );
        }

        // 2. Role Security enforcement (Backend)
        // Spring Security's getAuthority() always returns the full "ROLE_" prefixed string
        // (e.g. "ROLE_ADMIN", "ROLE_TECHNICIAN") because CustomUserDetailsService uses
        // new SimpleGrantedAuthority("ROLE_" + user.getRole().name()). Comparing against
        // bare "ADMIN" / "TECHNICIAN" always evaluates to false, silently blocking every
        // admin and technician status update with an UnauthorizedAccessException.
        if ("ROLE_ADMIN".equals(role)) return;

        if ("ROLE_TECHNICIAN".equals(role)) {
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
