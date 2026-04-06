package com.unisphere.security;

import com.unisphere.entity.User;
import com.unisphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;

/**
 * Custom UserDetailsService
 * Loads user details from the database by email
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
            
            if (!user.getIsActive()) {
                throw new UsernameNotFoundException("User account is inactive");
            }
            
            Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            
            String password = user.getPassword() != null && !user.getPassword().isEmpty() ? 
                    user.getPassword() : "{noop}"; // {noop} for empty password or OAuth users
            
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(password)
                    .authorities(authorities)
                    .disabled(!user.getIsActive())
                    .build();
        } catch (UsernameNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error loading user by email: {}", email, e);
            throw new UsernameNotFoundException("Error loading user details", e);
        }
    }
}
