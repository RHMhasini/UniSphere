package com.unisphere;

import org.springframework.boot.SpringApplication;

/**
 * Smart Campus Operations Hub Application
 * REST API for managing facility bookings and incident ticketing
 *
 * NOTE: UniSphereApplication is the designated main entry point (see pom.xml).
 * This class is kept for historical reference only.
 * Do NOT annotate with @SpringBootApplication — doing so causes a duplicate
 * Spring context and conflicting bean registrations alongside UniSphereApplication.
 */
public class UniCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniSphereApplication.class, args);
    }
}
