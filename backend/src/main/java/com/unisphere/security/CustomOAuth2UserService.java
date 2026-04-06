package com.unisphere.security;

import com.unisphere.entity.User;
import com.unisphere.entity.enums.RegistrationStatus;
import com.unisphere.entity.enums.UserRole;
import com.unisphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private static final String ADMIN_EMAIL = "shashikashyamali60@gmail.com";

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("Loading user from OAuth2 provider: {}", userRequest.getClientRegistration().getRegistrationId());
        OAuth2User oAuth2User = super.loadUser(userRequest);
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            // Spring Security requires an OAuth2Error object
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user"), ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // Debug attributes
        log.debug("OAuth2 User Attributes: {}", attributes);
        
        String email = (String) attributes.get("email");
        String oauthId = (String) attributes.get("sub");
        String fullName = (String) attributes.get("name");
        String firstName = (String) attributes.get("given_name");
        String lastName = (String) attributes.get("family_name");
        String picture = (String) attributes.get("picture");

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            log.info("Updating existing user: {}", email);
            user.setOauthProvider(provider);
            user.setOauthId(oauthId);
            user.setLastLogin(LocalDateTime.now());
            
            if (fullName != null) user.setFullName(fullName);
            if (firstName != null) user.setFirstName(firstName);
            if (lastName != null) user.setLastName(lastName);
            if (picture != null) user.setProfilePictureUrl(picture);
            
            if (email.equalsIgnoreCase(ADMIN_EMAIL)) {
                user.setRole(UserRole.ADMIN);
                user.setRegistrationStatus(RegistrationStatus.APPROVED);
            }
        } else {
            log.info("Creating new user from OAuth2: {}", email);
            user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setOauthProvider(provider);
            user.setOauthId(oauthId);
            user.setProfilePictureUrl(picture);
            
            if (email.equalsIgnoreCase(ADMIN_EMAIL)) {
                user.setRole(UserRole.ADMIN);
                user.setRegistrationStatus(RegistrationStatus.APPROVED);
            } else {
                user.setRole(UserRole.STUDENT);
                user.setRegistrationStatus(RegistrationStatus.PENDING_DETAILS);
            }
            
            user.setIsActive(true);
            user.setEmailVerified(true);
            user.setPassword("");
            user.setCreatedAt(LocalDateTime.now());
            user.setLastLogin(LocalDateTime.now());
        }

        userRepository.save(user);
        log.info("User {} (Role: {}) successfully saved with status {}", email, user.getRole(), user.getRegistrationStatus());
        return oAuth2User;
    }
}
