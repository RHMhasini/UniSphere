package com.unisphere.controller;

import com.unisphere.dto.CommentResponse;
import com.unisphere.dto.CreateCommentRequest;
import com.unisphere.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RESTful Comment Controller — sub-resource of tickets
 *
 * Base path: /api/tickets/{ticketId}/comments
 *
 *   POST   /api/tickets/{ticketId}/comments                    — add comment
 *   GET    /api/tickets/{ticketId}/comments                    — list comments for ticket
 *   PATCH  /api/tickets/{ticketId}/comments/{commentId}        — edit own comment
 *   DELETE /api/tickets/{ticketId}/comments/{commentId}?userId= — delete own comment
 */
@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, request));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    /**
     * Edit a comment — only the comment's author (userId) may edit.
     * Body: { "userId": "u1001", "message": "Updated comment text" }
     */
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponse> editComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(
                commentService.updateComment(commentId, request.getUserId(), request.getMessage()));
    }

    /**
     * Delete a comment — only the comment's author may delete.
     * ?userId=u1001  (passed as query param so no body needed for DELETE)
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
