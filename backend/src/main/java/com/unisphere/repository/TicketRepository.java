package com.unisphere.repository;

import com.unisphere.entity.Ticket;
import com.unisphere.enums.Category;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByCreatedBy(String createdBy);
    List<Ticket> findByAssignedTo(String assignedTo);
    List<Ticket> findByCategory(Category category);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByStatusAndCategory(TicketStatus status, Category category);
    List<Ticket> findByStatusAndPriority(TicketStatus status, TicketPriority priority);
    List<Ticket> findByCreatedByAndStatus(String createdBy, TicketStatus status);
    List<Ticket> findByAssignedToAndStatus(String assignedTo, TicketStatus status);
    long countByStatus(TicketStatus status);
    long countByAssignedTo(String assignedTo);
    long countByCreatedBy(String createdBy);
}
