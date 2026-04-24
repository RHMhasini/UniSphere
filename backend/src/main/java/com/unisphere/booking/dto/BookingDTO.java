package com.unisphere.booking.dto;

import com.unisphere.booking.model.BookingStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {

    // Request fields (what frontend sends)
    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @Positive(message = "Expected attendees must be positive")
    private int expectedAttendees;

    // Response fields (what backend sends back)
    private String id;
    private String userId;
    private String userName;
    private BookingStatus status;
    private String adminReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}