package com.unisphere.booking.repository;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Get all bookings by a specific user
    List<Booking> findByUserId(String userId);

    // Get all bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Get all bookings for a specific resource
    List<Booking> findByResourceId(String resourceId);

    // Conflict check — finds overlapping bookings for same resource
    @Query("{ 'resourceId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);

    // Get bookings by userId and status
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    // Get bookings for reminder scheduler
    List<Booking> findByStatusAndReminderSentFalseAndStartTimeBetween(BookingStatus status, LocalDateTime start, LocalDateTime end);
}