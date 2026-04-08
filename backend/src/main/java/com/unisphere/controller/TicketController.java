package com.unisphere.controller;

import com.unisphere.dto.AssignTicketRequest;
import com.unisphere.dto.CreateTicketRequest;
import com.unisphere.dto.TicketResponse;
import com.unisphere.dto.UpdateTicketStatusRequest;
import com.unisphere.enums.TicketStatus;
import com.unisphere.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {
    private final TicketService ticketService;

    /**
     * Create a new ticket
     * POST /api/tickets
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody CreateTicketRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all tickets
     * GET /api/tickets
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get ticket by ID
     * GET /api/tickets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id) {
        TicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Update ticket status
     * PUT /api/tickets/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable String id,
            @RequestBody UpdateTicketStatusRequest request) {
        TicketResponse response = ticketService.updateTicketStatus(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Assign technician to ticket
     * PUT /api/tickets/{id}/assign
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable String id,
            @RequestBody AssignTicketRequest request) {
        TicketResponse response = ticketService.assignTicket(id, request.getAssignedTo());
        return ResponseEntity.ok(response);
    }

    /**
     * Delete ticket
     * DELETE /api/tickets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get tickets by status
     * GET /api/tickets/filter/status?status=OPEN
     */
    @GetMapping("/filter/status")
    public ResponseEntity<List<TicketResponse>> getTicketsByStatus(@RequestParam TicketStatus status) {
        List<TicketResponse> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets created by user
     * GET /api/tickets/filter/created-by?userId=user123
     */
    @GetMapping("/filter/created-by")
    public ResponseEntity<List<TicketResponse>> getTicketsByCreatedBy(@RequestParam String userId) {
        List<TicketResponse> tickets = ticketService.getTicketsByCreatedBy(userId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets assigned to technician
     * GET /api/tickets/filter/assigned-to?techId=tech123
     */
    @GetMapping("/filter/assigned-to")
    public ResponseEntity<List<TicketResponse>> getTicketsAssignedTo(@RequestParam String techId) {
        List<TicketResponse> tickets = ticketService.getTicketsAssignedTo(techId);
        return ResponseEntity.ok(tickets);
    }
}
