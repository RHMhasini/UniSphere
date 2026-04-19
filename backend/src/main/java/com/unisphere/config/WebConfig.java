package com.unisphere.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final SecurityHeaderInterceptor securityHeaderInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply to all /api/** endpoints
        registry.addInterceptor(securityHeaderInterceptor)
                .addPathPatterns("/api/**");
    }
}
