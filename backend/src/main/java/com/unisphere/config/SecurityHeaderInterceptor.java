package com.unisphere.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Collections;
import java.util.List;

/**
 * A temporary interceptor to bridge the gap while Case Module E (Auth) is being developed.
 * It reads user identity from custom headers and populates the SecurityContextHolder.
 */
@Component
public class SecurityHeaderInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");

        if (email != null && !email.isBlank()) {
            // Default role to STUDENT if not provided
            String roleName = (role != null && !role.isBlank()) ? role : "STUDENT";
            
            // In Spring Security, roles are typically prefixed with "ROLE_"
            // However, the user's plan logic checks for direct strings like "ADMIN"
            // We will provide both for maximum compatibility.
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority(roleName)
            );

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    email, null, authorities
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Clear context after request to avoid leak in thread pool
        SecurityContextHolder.clearContext();
    }
}
