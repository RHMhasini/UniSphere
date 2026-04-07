package com.unisphere.booking.service;

import com.unisphere.booking.dto.BookingDTO;
import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.BookingStatus;
import com.unisphere.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import com.unisphere.booking.event.BookingStatusChangedEvent;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Create a new booking
    public Booking createBooking(BookingDTO dto, String userId, String userName) {

        // Check for conflicts first
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getResourceId(),
                dto.getStartTime(),
                dto.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("This resource is already booked for the selected time slot.");
        }

        Booking booking = new Booking();
        booking.setResourceId(dto.getResourceId());
        booking.setResourceName(dto.getResourceName());
        booking.setUserId(userId);
        booking.setUserName(userName);
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    // Get all bookings for a specific user
    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Get all bookings (admin only)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Get a single booking by ID
    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    // Approve a booking (admin only)
    public Booking approveBooking(String id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        
        eventPublisher.publishEvent(new BookingStatusChangedEvent(this, saved.getId(), saved.getUserId(), BookingStatus.PENDING, BookingStatus.APPROVED));
        
        return saved;
    }

    // Reject a booking (admin only)
    public Booking rejectBooking(String id, String reason) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        
        eventPublisher.publishEvent(new BookingStatusChangedEvent(this, saved.getId(), saved.getUserId(), BookingStatus.PENDING, BookingStatus.REJECTED));
        
        return saved;
    }

    // Cancel a booking (user only)
    public Booking cancelBooking(String id, String userId) {
        Booking booking = getBookingById(id);

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings.");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED bookings can be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        
        eventPublisher.publishEvent(new BookingStatusChangedEvent(this, saved.getId(), saved.getUserId(), BookingStatus.APPROVED, BookingStatus.CANCELLED));
        
        return saved;
    }

    // Get bookings by status (admin)
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }
}