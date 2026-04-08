package com.unisphere.service.impl;

import com.unisphere.dto.CommentResponse;
import com.unisphere.dto.CreateCommentRequest;
import com.unisphere.entity.Comment;
import com.unisphere.entity.Ticket;
import com.unisphere.enums.NotificationType;
import com.unisphere.repository.CommentRepository;
import com.unisphere.repository.TicketRepository;
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

    private static final String DEFAULT_USER = "user123";

    @Override
    public CommentResponse addComment(String ticketId, CreateCommentRequest request) {
        // Verify ticket exists
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(DEFAULT_USER)
                .message(request.getMessage())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Create notification for comment
        String notificationMessage = String.format(
                "New comment on ticket #%s: %s",
                ticketId, request.getMessage()
        );
        notificationService.createNotification(
                ticket.getCreatedBy(),
                notificationMessage,
                NotificationType.COMMENT.toString()
        );

        return mapToResponse(savedComment);
    }

    @Override
    public List<CommentResponse> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketId(ticketId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .userId(comment.getUserId())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
