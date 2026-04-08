package com.unisphere.controller;

import com.unisphere.dto.CommentResponse;
import com.unisphere.dto.CreateCommentRequest;
import com.unisphere.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {
    private final CommentService commentService;

    /**
     * Add comment to ticket
     * POST /api/tickets/{ticketId}/comments
     */
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String ticketId,
            @RequestBody CreateCommentRequest request) {
        CommentResponse response = commentService.addComment(ticketId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all comments for a ticket
     * GET /api/tickets/{ticketId}/comments
     */
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByTicketId(@PathVariable String ticketId) {
        List<CommentResponse> comments = commentService.getCommentsByTicketId(ticketId);
        return ResponseEntity.ok(comments);
    }

    /**
     * Delete comment
     * DELETE /api/tickets/{ticketId}/comments/{commentId}
     */
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
