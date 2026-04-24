package com.unisphere.repository;

import com.unisphere.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketId(String ticketId);
    void deleteByTicketId(String ticketId);
    List<Comment> findByUserId(String userId);
}
