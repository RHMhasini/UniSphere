package com.unisphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommentRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "message is required")
    private String message;
}
