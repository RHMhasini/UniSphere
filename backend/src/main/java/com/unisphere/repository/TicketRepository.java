package com.unisphere.repository;

import com.unisphere.entity.Ticket;
import com.unisphere.enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByCreatedBy(String createdBy);
    List<Ticket> findByAssignedTo(String assignedTo);
    List<Ticket> findByCategory(String category);
}
