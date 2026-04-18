package com.unisphere.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.unisphere.entity.User;
import com.unisphere.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");
        String picture = (String) oAuth2User.getAttributes().get("picture");

        // Validate that the Google email matches an allowed institutional format
        boolean isStudent    = email != null && email.matches("^[A-Za-z]{2}[0-9]{8}@my\\.sliit\\.lk$");
        boolean isLecturer   = email != null && email.matches("^[a-zA-Z0-9._%+\\-]+lec@gmail\\.com$");
        boolean isTechnician = email != null && email.matches("^[a-zA-Z0-9._%+\\-]+tec@gmail\\.com$");
        boolean isAdmin      = "admin23unisphere@gmail.com".equalsIgnoreCase(email);

        if (!isStudent && !isLecturer && !isTechnician && !isAdmin) {
            log.warn("OAuth2 login blocked for unauthorized email: {}", email);
            String errorUrl = "http://localhost:5173/login?error=invalid_email";
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new user from OAuth2 login: email={}", email);
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name != null ? name : "OAuth2 User");
            newUser.setFirstName(name != null ? name.split(" ")[0] : "User");
            newUser.setLastName(name != null && name.split(" ").length > 1 ? name.split(" ")[1] : "");
            newUser.setProfilePictureUrl(picture);
            newUser.setIsActive(true);
            // User is created with default role STUDENT and status PENDING_DETAILS
            return userRepository.save(newUser);
        });

        // Always update the profile picture from Google if we don't have one
        if ((user.getProfilePictureUrl() == null || user.getProfilePictureUrl().isEmpty()) && picture != null) {
            user.setProfilePictureUrl(picture);
            userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("status", user.getRegistrationStatus().name())
                .queryParam("role", user.getRole().name())
                .queryParam("isActive", user.getIsActive())
                .build().toUriString();

        log.info("OAuth2 authentication successful for email={}, redirecting to {}", email, targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
