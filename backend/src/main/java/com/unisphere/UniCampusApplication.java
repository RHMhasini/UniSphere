package com.unisphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Smart Campus Operations Hub Application
 * REST API for managing facility bookings and incident ticketing
 */
@SpringBootApplication
@EnableScheduling
public class UniCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniCampusApplication.class, args);
    }
}
