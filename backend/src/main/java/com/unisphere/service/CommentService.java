package com.unisphere.service;

import com.unisphere.dto.CommentResponse;
import com.unisphere.dto.CreateCommentRequest;

import java.util.List;

public interface CommentService {
    CommentResponse addComment(String ticketId, CreateCommentRequest request);
    List<CommentResponse> getCommentsByTicketId(String ticketId);
    CommentResponse updateComment(String commentId, String userId, String newMessage);
    void deleteComment(String commentId, String userId);
}
