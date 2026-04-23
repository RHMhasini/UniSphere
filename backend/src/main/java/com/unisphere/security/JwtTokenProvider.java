package com.unisphere.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Token Provider - Updated for JJWT 0.12.x
 * Handles secure token generation and validation for Smart Campus Operations Hub
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    
    @Value("${app.jwt.secret:mySuperSecretKeyForJWTTokenGenerationAndValidationInDevelopmentOnlyChangeInProduction}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpirationMs;
    
    @Value("${app.jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String email, String userId, String role) {
        return createToken(email, userId, role, jwtExpirationMs);
    }

    public String generateRefreshToken(String email, String userId, String role) {
        return createToken(email, userId, role, refreshTokenExpirationMs);
    }

    private String createToken(String email, String userId, String role, long expirationTime) {
        try {
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("userId", userId);
            extraClaims.put("email", email);
            extraClaims.put("role", role);

            return Jwts.builder()
                    .claims(extraClaims)
                    .subject(email)
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + expirationTime))
                    .signWith(getSigningKey())
                    .compact();
        } catch (Exception e) {
            log.error("Error generating JWT token", e);
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public String getRoleFromToken(String token) {
        return (String) getAllClaimsFromToken(token).get("role");
    }

    public String getEmailFromToken(String token) {
        return getAllClaimsFromToken(token).getSubject();
    }

    public String getUserIdFromToken(String token) {
        return (String) getAllClaimsFromToken(token).get("userId");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Date getExpirationDateFromToken(String token) {
        return getAllClaimsFromToken(token).getExpiration();
    }

    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Error extracting claims from JWT token", e);
            throw new RuntimeException("Failed to extract claims from JWT token", e);
        }
    }
}
