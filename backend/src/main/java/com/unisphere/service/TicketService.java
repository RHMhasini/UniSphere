package com.unisphere.service;

import com.unisphere.dto.*;
import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;

import java.util.List;
import java.util.Map;

public interface TicketService {

    // ── CRUD ──────────────────────────────────────────────────────────────────
    TicketResponse createTicket(CreateTicketRequest request);
    TicketResponse getTicketById(String id);
    List<TicketResponse> getAllTickets();
    TicketResponse updateTicket(String id, UpdateTicketRequest request);
    void deleteTicket(String id);

    // ── Workflow ──────────────────────────────────────────────────────────────
    TicketResponse updateTicketStatus(String id, UpdateTicketStatusRequest request);
    TicketResponse assignTicket(String id, AssignTicketRequest request);

    // ── Filtering ─────────────────────────────────────────────────────────────
    List<TicketResponse> getTicketsByStatus(TicketStatus status);
    List<TicketResponse> getTicketsByCategory(Category category);
    List<TicketResponse> getTicketsByPriority(TicketPriority priority);
    List<TicketResponse> getTicketsByCreatedBy(String createdBy);
    List<TicketResponse> getTicketsAssignedTo(String assignedTo);
    List<TicketResponse> filterTickets(TicketStatus status, Category category,
                                       TicketPriority priority, String createdBy, String assignedTo);

    /** Filter tickets based on the authenticated user's role and identity */
    List<TicketResponse> getTicketsForUser(String email, String role);

    // ── History ───────────────────────────────────────────────────────────────
    List<TicketHistoryResponse> getTicketHistory(String ticketId);

    // ── Stats (for admin dashboard) ───────────────────────────────────────────
    Map<String, Long> getStatusCounts();

    /** Full ticket list including archived — ADMIN only (enforced in service). */
    List<TicketResponse> getFullTicketRegisterForAdmin();
}
