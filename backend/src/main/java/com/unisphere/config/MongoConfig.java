package com.unisphere.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    // Relying on Spring Boot AutoConfiguration for MongoClient
    // application.properties will configure the connection to Atlas.
}
