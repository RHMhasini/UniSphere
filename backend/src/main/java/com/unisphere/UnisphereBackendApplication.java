package com.unisphere;

/**
 * Legacy entry point retained for backwards compatibility with the booking module branch.
 * The canonical application entry point is {@link UniSphereApplication}.
 *
 * This class intentionally does NOT carry @SpringBootApplication so that Spring Boot
 * does not discover two application contexts on the classpath and fail to start.
 * All dotenv / environment loading is handled inside UniSphereApplication#loadDotenv().
 */
public class UnisphereBackendApplication {

    /**
     * Delegates immediately to the real entry point.
     * Keeping this method means any IDE run-configuration or script that references
     * "UnisphereBackendApplication" will still work without modification.
     */
    public static void main(String[] args) {
        UniSphereApplication.main(args);
    }
}
