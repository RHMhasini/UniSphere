package com.unisphere.controller;

import com.unisphere.dto.CommentResponse;
import com.unisphere.dto.CreateCommentRequest;
import com.unisphere.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RESTful Comment Controller — sub-resource of tickets
 *
 * Base path: /api/tickets/{ticketId}/comments
 *
 *   POST   /api/tickets/{ticketId}/comments                     — add comment
 *   GET    /api/tickets/{ticketId}/comments                     — list comments for ticket
 *   PATCH  /api/tickets/{ticketId}/comments/{commentId}         — edit own comment
 *   PUT    /api/tickets/{ticketId}/comments/{commentId}         — edit own comment (frontend-friendly)
 *   DELETE /api/tickets/{ticketId}/comments/{commentId}         — delete own comment
 */
@RestController
@RequestMapping("/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    private String actorEmailOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) return null;
        return auth.getName();
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CreateCommentRequest request) {
        String actor = actorEmailOrNull();
        if (actor != null) {
            request.setUserId(actor);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(ticketId, request));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponse> editCommentPatch(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CreateCommentRequest request) {
        String actor = actorEmailOrNull();
        if (actor != null) {
            request.setUserId(actor);
        }
        return ResponseEntity.ok(commentService.updateComment(commentId, request.getUserId(), request.getMessage()));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> editCommentPut(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CreateCommentRequest request) {
        return editCommentPatch(ticketId, commentId, request);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam(required = false) String userId) {
        String actor = actorEmailOrNull();
        String effectiveUserId = (actor != null) ? actor : userId;
        if (effectiveUserId == null || effectiveUserId.isBlank()) {
            throw new IllegalArgumentException("userId is required (or provide X-User-Email header)");
        }
        commentService.deleteComment(commentId, effectiveUserId);
        return ResponseEntity.noContent().build();
    }
}
