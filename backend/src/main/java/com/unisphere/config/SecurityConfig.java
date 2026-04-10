package com.unisphere.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Temporary open security configuration while the auth module (OAuth2 / JWT)
 * is being built by the auth team.
 *
 * TODO: Replace with full role-based security before submission.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})          // handled by @CrossOrigin on controllers
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // open for now — auth team will lock this down
            );
        return http.build();
    }
}
