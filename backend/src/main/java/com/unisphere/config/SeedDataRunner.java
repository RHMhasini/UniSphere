package com.unisphere.config;

import com.unisphere.entity.*;
import com.unisphere.enums.*;
import com.unisphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds realistic campus data on first startup (when all collections are empty).
 * Disable by setting app.seed.enabled=false in application.properties.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class SeedDataRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("[SeedDataRunner] Clearing old database collections...");
        userRepository.deleteAll();
        ticketRepository.deleteAll();
        commentRepository.deleteAll();
        ticketHistoryRepository.deleteAll();
        notificationRepository.deleteAll();
        
        System.out.println("[SeedDataRunner] Seeding database with mock campus data...");

        // ── 1. Users ─────────────────────────────────────────────────────────────
        LocalDateTime now = LocalDateTime.now();

        userRepository.saveAll(List.of(
                User.builder().id("u1001").name("Nimal Perera")
                        .email("nimal.perera@university.edu").role(UserRole.STUDENT).createdAt(now).build(),
                User.builder().id("u1002").name("Kasun Silva")
                        .email("kasun.silva@university.edu").role(UserRole.LECTURER).createdAt(now).build(),
                User.builder().id("u1003").name("Chathura Jayasinghe")
                        .email("chathura.tech@university.edu").role(UserRole.TECHNICIAN).createdAt(now).build(),
                User.builder().id("u1004").name("Amali Fernando")
                        .email("amali.tech@university.edu").role(UserRole.TECHNICIAN).createdAt(now).build(),
                User.builder().id("u1005").name("Admin User")
                        .email("admin@university.edu").role(UserRole.ADMIN).createdAt(now).build()
        ));

        // ── 2. Tickets ────────────────────────────────────────────────────────────

        LocalDateTime yesterday = now.minusDays(1);
        LocalDateTime twoDaysAgo = now.minusDays(2);
        LocalDateTime threeDaysAgo = now.minusDays(3);

        Ticket t1 = Ticket.builder()
                .id("t2001")
                .title("Projector not working in Lecture Hall 3")
                .description("The projector powers on but shows a blank screen. HDMI adapter might be faulty. Issue started during morning session.")
                .category(Category.HARDWARE)
                .priority(TicketPriority.HIGH)
                .status(TicketStatus.OPEN)
                .createdBy("u1001")
                .assignedTo("u1003")
                .location("Lecture Hall 3")
                .contactEmail("nimal.perera@university.edu")
                .contactPhone("0712345678")
                .attachments(List.of())
                .createdAt(yesterday)
                .updatedAt(yesterday)
                .build();

        Ticket t2 = Ticket.builder()
                .id("t2002")
                .title("WiFi connectivity issue in Computer Lab 1")
                .description("Students cannot connect to the university WiFi network in Lab 1. Frequent disconnections during practical sessions causing disruption.")
                .category(Category.SOFTWARE)
                .priority(TicketPriority.MEDIUM)
                .status(TicketStatus.IN_PROGRESS)
                .createdBy("u1002")
                .assignedTo("u1003")
                .location("Computer Lab 1")
                .contactEmail("kasun.silva@university.edu")
                .contactPhone("0723456789")
                .attachments(List.of())
                .createdAt(twoDaysAgo)
                .updatedAt(yesterday)
                .build();

        Ticket t3 = Ticket.builder()
                .id("t2003")
                .title("Broken chair in library reading area")
                .description("One chair has a broken leg and is unsafe for students. Several complaints received from library users.")
                .category(Category.FACILITY)
                .priority(TicketPriority.LOW)
                .status(TicketStatus.RESOLVED)
                .createdBy("u1001")
                .assignedTo("u1004")
                .location("Main Library - Reading Area")
                .contactEmail("nimal.perera@university.edu")
                .contactPhone("0712345678")
                .attachments(List.of())
                .resolutionNote("Chair has been replaced with a new one from the storage room.")
                .createdAt(threeDaysAgo)
                .updatedAt(now)
                .build();

        Ticket t4 = Ticket.builder()
                .id("t2004")
                .title("Air conditioning not working in Lab 2")
                .description("The AC unit in Computer Lab 2 has stopped working. Temperature is very high and affecting student concentration during long practicals.")
                .category(Category.FACILITY)
                .priority(TicketPriority.URGENT)
                .status(TicketStatus.IN_PROGRESS)
                .createdBy("u1002")
                .assignedTo("u1004")
                .location("Computer Lab 2")
                .contactEmail("kasun.silva@university.edu")
                .contactPhone("0723456789")
                .attachments(List.of())
                .createdAt(yesterday)
                .updatedAt(now)
                .build();

        Ticket t5 = Ticket.builder()
                .id("t2005")
                .title("Student portal login error after password reset")
                .description("Multiple students are unable to log into the student portal after performing a password reset. Error message: 'Invalid credentials'.")
                .category(Category.SOFTWARE)
                .priority(TicketPriority.HIGH)
                .status(TicketStatus.CLOSED)
                .createdBy("u1001")
                .assignedTo("u1003")
                .location("IT Help Desk (Remote)")
                .contactEmail("nimal.perera@university.edu")
                .contactPhone("0712345678")
                .attachments(List.of())
                .resolutionNote("Issue was a cache problem on the authentication server. Cleared and restarted the service. Verified with 5 students — all working now.")
                .createdAt(threeDaysAgo)
                .updatedAt(twoDaysAgo)
                .build();

        Ticket t6 = Ticket.builder()
                .id("t2006")
                .title("Missing whiteboard markers in Room B204")
                .description("Whiteboard markers are missing from Room B204. Lecturers have been using their own markers for over a week.")
                .category(Category.FACILITY)
                .priority(TicketPriority.LOW)
                .status(TicketStatus.REJECTED)
                .createdBy("u1001")
                .assignedTo(null)
                .location("Room B204")
                .contactEmail("nimal.perera@university.edu")
                .contactPhone("0712345678")
                .attachments(List.of())
                .rejectionReason("Whiteboard marker procurement is handled by the department office, not the maintenance team. Please contact the department coordinator.")
                .createdAt(twoDaysAgo)
                .updatedAt(yesterday)
                .build();

        ticketRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6));

        // ── 3. Comments ───────────────────────────────────────────────────────────

        commentRepository.saveAll(List.of(
                Comment.builder()
                        .id("c3001").ticketId("t2001").userId("u1001")
                        .message("Issue started yesterday morning during the 8am lecture. Tried a different laptop — same blank screen result.")
                        .createdAt(yesterday).updatedAt(yesterday).build(),

                Comment.builder()
                        .id("c3002").ticketId("t2001").userId("u1003")
                        .message("Inspected the projector. The HDMI port appears damaged. Will order a replacement cable. Will update by end of day.")
                        .createdAt(yesterday.plusHours(2)).updatedAt(yesterday.plusHours(2)).build(),

                Comment.builder()
                        .id("c3003").ticketId("t2001").userId("u1001")
                        .message("Thank you. The next lecture is at 2pm — please try to fix it before then if possible.")
                        .createdAt(yesterday.plusHours(3)).updatedAt(yesterday.plusHours(3)).build(),

                Comment.builder()
                        .id("c3004").ticketId("t2002").userId("u1002")
                        .message("This is affecting 30+ students during their DBMS practical. Please prioritise this issue.")
                        .createdAt(twoDaysAgo).updatedAt(twoDaysAgo).build(),

                Comment.builder()
                        .id("c3005").ticketId("t2002").userId("u1003")
                        .message("Currently reviewing the access point logs. Appears to be a DHCP exhaustion issue. Working on a fix.")
                        .createdAt(yesterday).updatedAt(yesterday).build(),

                Comment.builder()
                        .id("c3006").ticketId("t2004").userId("u1002")
                        .message("The temperature in the lab is above 35°C. Students are leaving early. This needs urgent attention.")
                        .createdAt(yesterday).updatedAt(yesterday).build(),

                Comment.builder()
                        .id("c3007").ticketId("t2004").userId("u1004")
                        .message("Checked the AC unit. Compressor is faulty. Ordered replacement parts — ETA 2 business days.")
                        .createdAt(now.minusHours(3)).updatedAt(now.minusHours(3)).build()
        ));

        // ── 4. Ticket History ─────────────────────────────────────────────────────

        ticketHistoryRepository.saveAll(List.of(
                // t2001 — OPEN
                TicketHistory.builder().id("h4001").ticketId("t2001")
                        .oldStatus(null).newStatus(TicketStatus.OPEN)
                        .changedBy("u1001").changedAt(yesterday).build(),

                // t2002 — OPEN → IN_PROGRESS
                TicketHistory.builder().id("h4002").ticketId("t2002")
                        .oldStatus(null).newStatus(TicketStatus.OPEN)
                        .changedBy("u1002").changedAt(twoDaysAgo).build(),
                TicketHistory.builder().id("h4003").ticketId("t2002")
                        .oldStatus(TicketStatus.OPEN).newStatus(TicketStatus.IN_PROGRESS)
                        .changedBy("u1003").changedAt(yesterday).build(),

                // t2003 — OPEN → IN_PROGRESS → RESOLVED
                TicketHistory.builder().id("h4004").ticketId("t2003")
                        .oldStatus(null).newStatus(TicketStatus.OPEN)
                        .changedBy("u1001").changedAt(threeDaysAgo).build(),
                TicketHistory.builder().id("h4005").ticketId("t2003")
                        .oldStatus(TicketStatus.OPEN).newStatus(TicketStatus.IN_PROGRESS)
                        .changedBy("u1004").changedAt(twoDaysAgo).build(),
                TicketHistory.builder().id("h4006").ticketId("t2003")
                        .oldStatus(TicketStatus.IN_PROGRESS).newStatus(TicketStatus.RESOLVED)
                        .changedBy("u1004").changedAt(now).build(),

                // t2004 — OPEN → IN_PROGRESS
                TicketHistory.builder().id("h4007").ticketId("t2004")
                        .oldStatus(null).newStatus(TicketStatus.OPEN)
                        .changedBy("u1002").changedAt(yesterday).build(),
                TicketHistory.builder().id("h4008").ticketId("t2004")
                        .oldStatus(TicketStatus.OPEN).newStatus(TicketStatus.IN_PROGRESS)
                        .changedBy("u1004").changedAt(now.minusHours(4)).build(),

                // t2005 — full lifecycle OPEN → IN_PROGRESS → RESOLVED → CLOSED
                TicketHistory.builder().id("h4009").ticketId("t2005")
                        .oldStatus(null).newStatus(TicketStatus.OPEN)
                        .changedBy("u1001").changedAt(threeDaysAgo).build(),
                TicketHistory.builder().id("h4010").ticketId("t2005")
                        .oldStatus(TicketStatus.OPEN).newStatus(TicketStatus.IN_PROGRESS)
                        .changedBy("u1003").changedAt(threeDaysAgo.plusHours(1)).build(),
                TicketHistory.builder().id("h4011").ticketId("t2005")
                        .oldStatus(TicketStatus.IN_PROGRESS).newStatus(TicketStatus.RESOLVED)
                        .changedBy("u1003").changedAt(twoDaysAgo).build(),
                TicketHistory.builder().id("h4012").ticketId("t2005")
                        .oldStatus(TicketStatus.RESOLVED).newStatus(TicketStatus.CLOSED)
                        .changedBy("u1005").changedAt(twoDaysAgo.plusHours(2)).build(),

                // t2006 — OPEN → REJECTED
                TicketHistory.builder().id("h4013").ticketId("t2006")
                        .oldStatus(null).newStatus(TicketStatus.OPEN)
                        .changedBy("u1001").changedAt(twoDaysAgo).build(),
                TicketHistory.builder().id("h4014").ticketId("t2006")
                        .oldStatus(TicketStatus.OPEN).newStatus(TicketStatus.REJECTED)
                        .changedBy("u1005").changedAt(yesterday).build()
        ));

        // ── 5. Notifications ──────────────────────────────────────────────────────

        notificationRepository.saveAll(List.of(
                // Student u1001 — ticket created
                Notification.builder().id("n5001").userId("u1001")
                        .message("Your ticket 'Projector not working in Lecture Hall 3' has been submitted.")
                        .type(NotificationType.STATUS_UPDATE).isRead(false).createdAt(yesterday).build(),

                // Technician u1003 — assigned to t2001
                Notification.builder().id("n5002").userId("u1003")
                        .message("You have been assigned to ticket: 'Projector not working in Lecture Hall 3'.")
                        .type(NotificationType.ASSIGNMENT).isRead(true).createdAt(yesterday).build(),

                // u1001 — new comment by technician on t2001
                Notification.builder().id("n5003").userId("u1001")
                        .message("Technician commented on your ticket 'Projector not working in Lecture Hall 3'.")
                        .type(NotificationType.COMMENT).isRead(false).createdAt(yesterday.plusHours(2)).build(),

                // u1002 — t2002 status moved to IN_PROGRESS
                Notification.builder().id("n5004").userId("u1002")
                        .message("Your ticket 'WiFi connectivity issue in Computer Lab 1' is now IN_PROGRESS.")
                        .type(NotificationType.STATUS_UPDATE).isRead(true).createdAt(yesterday).build(),

                // u1001 — t2003 resolved
                Notification.builder().id("n5005").userId("u1001")
                        .message("Your ticket 'Broken chair in library reading area' has been RESOLVED.")
                        .type(NotificationType.STATUS_UPDATE).isRead(true).createdAt(now).build(),

                // u1001 — t2006 rejected
                Notification.builder().id("n5006").userId("u1001")
                        .message("Your ticket 'Missing whiteboard markers in Room B204' has been REJECTED. Reason: Whiteboard marker procurement is handled by the department office.")
                        .type(NotificationType.REJECTED).isRead(false).createdAt(yesterday).build(),

                // u1001 — t2005 closed
                Notification.builder().id("n5007").userId("u1001")
                        .message("Your ticket 'Student portal login error after password reset' has been CLOSED.")
                        .type(NotificationType.STATUS_UPDATE).isRead(true).createdAt(twoDaysAgo.plusHours(2)).build(),

                // u1002 — comment on t2004
                Notification.builder().id("n5008").userId("u1004")
                        .message("New comment on ticket 'Air conditioning not working in Lab 2'.")
                        .type(NotificationType.COMMENT).isRead(false).createdAt(yesterday).build()
        ));

        System.out.println("[SeedDataRunner] ✅ Seed complete: 5 users, 6 tickets, 7 comments, 14 history entries, 8 notifications.");
    }
}
