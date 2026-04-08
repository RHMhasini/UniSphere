package com.unisphere.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    /** LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT */
    private String type;

    private int capacity;

    private String location;

    /** Comma-separated or list of time windows, e.g. "08:00-17:00" */
    private List<String> availabilityWindows;

    /** ACTIVE or OUT_OF_SERVICE */
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
