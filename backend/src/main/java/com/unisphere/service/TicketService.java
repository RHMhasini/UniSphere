package com.unisphere.service;

import com.unisphere.dto.CreateTicketRequest;
import com.unisphere.dto.TicketResponse;
import com.unisphere.dto.UpdateTicketStatusRequest;
import com.unisphere.enums.TicketStatus;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request);
    List<TicketResponse> getAllTickets();
    TicketResponse getTicketById(String id);
    TicketResponse updateTicketStatus(String id, UpdateTicketStatusRequest request);
    TicketResponse assignTicket(String id, String assignedTo);
    void deleteTicket(String id);
    List<TicketResponse> getTicketsByStatus(TicketStatus status);
    List<TicketResponse> getTicketsByCreatedBy(String createdBy);
    List<TicketResponse> getTicketsAssignedTo(String assignedTo);
}
