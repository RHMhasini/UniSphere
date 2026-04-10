package com.unisphere.controller;

import com.unisphere.dto.*;
import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;
import com.unisphere.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RESTful Ticket Controller — Module C: Maintenance & Incident Ticketing
 *
 * Base path: /api/tickets
 *
 * Endpoint summary:
 *   POST   /api/tickets                              — create a ticket
 *   GET    /api/tickets                              — list all tickets (optional ?status=&category=&priority=&createdBy=&assignedTo=)
 *   GET    /api/tickets/{id}                         — get ticket by id
 *   PATCH  /api/tickets/{id}                         — update ticket metadata (non-status fields)
 *   DELETE /api/tickets/{id}                         — delete ticket
 *   PUT    /api/tickets/{id}/status                  — transition ticket status
 *   PUT    /api/tickets/{id}/assign                  — assign technician
 *   GET    /api/tickets/{id}/history                 — get status change audit trail
 *   GET    /api/tickets/stats/status-counts          — count per status (admin dashboard)
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    // ── POST /api/tickets ─────────────────────────────────────────────────────

    /**
     * Create a new incident ticket.
     * Returns 201 Created.
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    // ── GET /api/tickets ──────────────────────────────────────────────────────

    /**
     * List tickets with optional query-string filters.
     * All params are optional and can be combined
     * e.g. GET /api/tickets?status=OPEN&category=HARDWARE&priority=HIGH
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) String assignedTo) {
        return ResponseEntity.ok(
                ticketService.filterTickets(status, category, priority, createdBy, assignedTo));
    }

    // ── GET /api/tickets/{id} ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // ── PATCH /api/tickets/{id} ───────────────────────────────────────────────

    /**
     * Partial update of ticket metadata (title, description, category, priority,
     * location, contact details, attachments).
     * Does NOT change status — use PUT /{id}/status for that.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    // ── DELETE /api/tickets/{id} ──────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // ── PUT /api/tickets/{id}/status ──────────────────────────────────────────

    /**
     * Transition ticket through its workflow:
     *   OPEN → IN_PROGRESS → RESOLVED → CLOSED
     *   Any status  → REJECTED (admin only, requires rejectionReason)
     *
     * Body: { "newStatus": "IN_PROGRESS", "changedBy": "u1003", "resolutionNote": "..." }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    // ── PUT /api/tickets/{id}/assign ──────────────────────────────────────────

    /**
     * Assign (or re-assign) a technician to the ticket.
     * Body: { "assignedTo": "u1003", "assignedBy": "u1004" }
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable String id,
            @Valid @RequestBody AssignTicketRequest request) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request));
    }

    // ── GET /api/tickets/{id}/history ─────────────────────────────────────────

    /**
     * Full audit trail of status changes for a ticket.
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketHistoryResponse>> getTicketHistory(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketHistory(id));
    }

    // ── GET /api/tickets/stats/status-counts ──────────────────────────────────

    /**
     * Returns counts per status, useful for admin dashboard widgets.
     * e.g. { "OPEN": 5, "IN_PROGRESS": 2, "RESOLVED": 10, "CLOSED": 3, "REJECTED": 1 }
     */
    @GetMapping("/stats/status-counts")
    public ResponseEntity<Map<String, Long>> getStatusCounts() {
        return ResponseEntity.ok(ticketService.getStatusCounts());
    }
}
