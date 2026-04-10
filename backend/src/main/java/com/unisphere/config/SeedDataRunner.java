package com.unisphere.config;

import com.unisphere.entity.Comment;
import com.unisphere.entity.Notification;
import com.unisphere.entity.Ticket;
import com.unisphere.entity.TicketHistory;
import com.unisphere.entity.User;
import com.unisphere.enums.Category;
import com.unisphere.enums.NotificationType;
import com.unisphere.enums.TicketPriority;
import com.unisphere.enums.TicketStatus;
import com.unisphere.enums.UserRole;
import com.unisphere.repository.CommentRepository;
import com.unisphere.repository.NotificationRepository;
import com.unisphere.repository.TicketHistoryRepository;
import com.unisphere.repository.TicketRepository;
import com.unisphere.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class SeedDataRunner implements ApplicationRunner {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public SeedDataRunner(
            TicketRepository ticketRepository,
            CommentRepository commentRepository,
            TicketHistoryRepository ticketHistoryRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (ticketRepository.count() > 0) {
            return;
        }

        userRepository.saveAll(List.of(
                User.builder()
                        .id("student001")
                        .name("Student One")
                        .email("student001@unisphere.edu")
                        .role(UserRole.STUDENT)
                        .build(),
                User.builder()
                        .id("student002")
                        .name("Student Two")
                        .email("student002@unisphere.edu")
                        .role(UserRole.STUDENT)
                        .build(),
                User.builder()
                        .id("tech001")
                        .name("Technician One")
                        .email("tech001@unisphere.edu")
                        .role(UserRole.TECHNICIAN)
                        .build(),
                User.builder()
                        .id("tech002")
                        .name("Technician Two")
                        .email("tech002@unisphere.edu")
                        .role(UserRole.TECHNICIAN)
                        .build(),
                User.builder()
                        .id("admin001")
                        .name("Admin One")
                        .email("admin001@unisphere.edu")
                        .role(UserRole.ADMIN)
                        .build()
        ));

        Ticket ticket1 = ticketRepository.save(Ticket.builder()
                .title("Projector not working in Lecture Hall A")
                .description("Projector powers on but shows a blank screen. HDMI/adapter might be faulty.")
                .category(Category.HARDWARE)
                .priority(TicketPriority.HIGH)
                .status(TicketStatus.OPEN)
                .createdBy("student001")
                .assignedTo("tech001")
                .location("Lecture Hall A")
                .contactEmail("student001@unisphere.edu")
                .contactPhone("+94 71 000 0001")
                .attachments(List.of("projector_issue.jpg"))
                .build());

        Ticket ticket2 = ticketRepository.save(Ticket.builder()
                .title("Wi-Fi unstable in Library 2nd floor")
                .description("Frequent disconnects and very slow speed during peak hours.")
                .category(Category.FACILITY)
                .priority(TicketPriority.MEDIUM)
                .status(TicketStatus.IN_PROGRESS)
                .createdBy("student002")
                .assignedTo("tech002")
                .location("Library - 2nd floor")
                .contactEmail("student002@unisphere.edu")
                .contactPhone("+94 71 000 0002")
                .attachments(List.of())
                .build());

        commentRepository.saveAll(List.of(
                Comment.builder()
                        .ticketId(ticket1.getId())
                        .userId("student001")
                        .message("Happening since this morning. Tried different laptop, same result.")
                        .build(),
                Comment.builder()
                        .ticketId(ticket2.getId())
                        .userId("tech002")
                        .message("Investigating access point logs. Will update once the issue is identified.")
                        .build()
        ));

        ticketHistoryRepository.saveAll(List.of(
                TicketHistory.builder()
                        .ticketId(ticket2.getId())
                        .oldStatus(TicketStatus.OPEN)
                        .newStatus(TicketStatus.IN_PROGRESS)
                        .changedBy("tech002")
                        .build()
        ));

        notificationRepository.saveAll(List.of(
                Notification.builder()
                        .userId("student001")
                        .message("Your ticket \"" + ticket1.getTitle() + "\" has been created.")
                        .type(NotificationType.STATUS_UPDATE)
                        .isRead(false)
                        .build(),
                Notification.builder()
                        .userId("student002")
                        .message("Your ticket \"" + ticket2.getTitle() + "\" is now in progress.")
                        .type(NotificationType.STATUS_UPDATE)
                        .isRead(false)
                        .build(),
                Notification.builder()
                        .userId("tech002")
                        .message("You have been assigned a new ticket: \"" + ticket2.getTitle() + "\".")
                        .type(NotificationType.ASSIGNMENT)
                        .isRead(false)
                        .build()
        ));
    }
}
