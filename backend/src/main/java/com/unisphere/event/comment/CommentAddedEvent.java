package com.unisphere.event.comment;

import com.unisphere.entity.Comment;
import com.unisphere.entity.Ticket;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentAddedEvent extends ApplicationEvent {
    private final Comment comment;
    private final Ticket ticket;

    public CommentAddedEvent(Object source, Comment comment, Ticket ticket) {
        super(source);
        this.comment = comment;
        this.ticket = ticket;
    }
}
