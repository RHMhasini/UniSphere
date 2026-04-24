package com.unisphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommentRequest {

    /**
     * Comment author.
     * During the "no-login-yet" phase this is inferred from the authenticated principal
     * set by {@link com.unisphere.config.SecurityHeaderInterceptor}.
     */
    private String userId;

    @NotBlank(message = "message is required")
    @Size(min = 3, max = 500, message = "Comment must be between 3 and 500 characters")
    private String message;
}
