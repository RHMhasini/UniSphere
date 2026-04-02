package com.unisphere.booking.controller;

import com.unisphere.booking.dto.BookingDTO;
import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.BookingStatus;
import com.unisphere.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings — Create a booking
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingDTO dto,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Name") String userName) {

        Booking booking = bookingService.createBooking(dto, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // GET /api/bookings/my — Get my bookings
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(
            @RequestHeader("X-User-Id") String userId) {

        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // GET /api/bookings — Get all bookings (admin)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {

        if (status != null) {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/bookings/{id} — Get single booking
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // PATCH /api/bookings/{id}/approve — Approve booking (admin)
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // PATCH /api/bookings/{id}/reject — Reject booking (admin)
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    // PATCH /api/bookings/{id}/cancel — Cancel booking (user)
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {

        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }
}