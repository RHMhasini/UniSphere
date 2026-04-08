package com.unisphere.controller.test;

import com.unisphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    private static final Logger log = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public Object listUsers() {
        try {
            return userRepository.findAll();
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GetMapping("/db-status")
    public Map<String, Object> getDbStatus() {
        Map<String, Object> status = new HashMap<>();
        try {
            long userCount = userRepository.count();
            status.put("connected", true);
            status.put("userCount", userCount);
            status.put("message", "Successfully connected to MongoDB");
        } catch (Exception e) {
            log.error("Database connection failed", e);
            status.put("connected", false);
            status.put("error", e.getMessage());
        }
        return status;
    }
}
