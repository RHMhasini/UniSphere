package com.unisphere;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UniSphereApplication {
    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(UniSphereApplication.class, args);
    }

    private static void loadDotenv() {
        Path envPath = Path.of(".env");
        if (!Files.exists(envPath)) {
            return;
        }

        try (Stream<String> lines = Files.lines(envPath)) {
            lines.map(String::trim)
                 .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                 .forEach(line -> {
                     int idx = line.indexOf('=');
                     if (idx > 0) {
                         String key = line.substring(0, idx).trim();
                         String value = line.substring(idx + 1).trim();
                         if (System.getProperty(key) == null) {
                             System.setProperty(key, value);
                         }
                     }
                 });
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load .env file", ex);
        }
    }
}
