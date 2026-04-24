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

import java.security.Principal;
import java.util.List;
import java.util.Map;
import com.unisphere.repository.UserRepository;
import com.unisphere.entity.User;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    // POST /api/bookings — Create a booking
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingDTO dto,
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String userId = user.getId();
        String userName = user.getFirstName() + " " + user.getLastName();

        Booking booking = bookingService.createBooking(dto, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // GET /api/bookings/my — Get my bookings
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
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
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId()));
    }

    // PUT /api/bookings/{id} — Update booking
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingDTO dto,
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(bookingService.updateBooking(id, dto, user.getId()));
    }
}
