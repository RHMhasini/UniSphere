package com.unisphere.repository;

import com.unisphere.entity.TicketHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketHistoryRepository extends MongoRepository<TicketHistory, String> {
    List<TicketHistory> findByTicketId(String ticketId);
}
