package com.unisphere.service.impl;

import com.unisphere.dto.CommentResponse;
import com.unisphere.dto.CreateCommentRequest;
import com.unisphere.entity.Comment;
import com.unisphere.entity.Ticket;
import com.unisphere.enums.NotificationType;
import com.unisphere.exception.ResourceNotFoundException;
import com.unisphere.repository.CommentRepository;
import com.unisphere.repository.TicketRepository;
import com.unisphere.repository.UserRepository;
import com.unisphere.service.CommentService;
import com.unisphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public CommentResponse addComment(String ticketId, CreateCommentRequest req) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(req.getUserId())
                .message(req.getMessage())
                .build();

        Comment saved = commentRepository.save(comment);

        // Notify the ticket creator if someone else commented
        if (!req.getUserId().equals(ticket.getCreatedBy())) {
            notificationService.createNotification(
                    ticket.getCreatedBy(),
                    "New comment on your ticket \"" + ticket.getTitle() + "\".",
                    NotificationType.COMMENT.name()
            );
        }

        // Notify the assigned technician if it's not them commenting
        if (ticket.getAssignedTo() != null
                && !ticket.getAssignedTo().isBlank()
                && !req.getUserId().equals(ticket.getAssignedTo())) {
            notificationService.createNotification(
                    ticket.getAssignedTo(),
                    "New comment on ticket \"" + ticket.getTitle() + "\".",
                    NotificationType.COMMENT.name()
            );
        }

        return mapToResponse(saved);
    }

    @Override
    public List<CommentResponse> getCommentsByTicketId(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found: " + ticketId);
        }
        return commentRepository.findByTicketId(ticketId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponse updateComment(String commentId, String userId, String newMessage) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!resolveActorIdentifiers(userId).contains(comment.getUserId())) {
            throw new IllegalArgumentException("You can only edit your own comments.");
        }

        comment.setMessage(newMessage);
        comment.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!resolveActorIdentifiers(userId).contains(comment.getUserId())) {
            throw new IllegalArgumentException("You can only delete your own comments.");
        }

        commentRepository.deleteById(commentId);
    }

    private CommentResponse mapToResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .ticketId(c.getTicketId())
                .userId(c.getUserId())
                .message(c.getMessage())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private java.util.Set<String> resolveActorIdentifiers(String emailOrId) {
        java.util.Set<String> ids = new java.util.LinkedHashSet<>();
        if (emailOrId == null || emailOrId.isBlank()) return ids;

        ids.add(emailOrId);
        // If caller provides an email, also accept its seeded user id.
        if (emailOrId.contains("@")) {
            userRepository.findByEmail(emailOrId).ifPresent(u -> {
                if (u.getId() != null && !u.getId().isBlank()) ids.add(u.getId());
            });
        }
        return ids;
    }
}
