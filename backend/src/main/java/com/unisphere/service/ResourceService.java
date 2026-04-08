package com.unisphere.service;

import com.unisphere.dto.ResourceRequest;
import com.unisphere.dto.ResourceResponse;
import com.unisphere.entity.Resource;
import com.unisphere.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // ────────────────────────────────────────────────
    // CREATE
    // ────────────────────────────────────────────────
    public ResourceResponse createResource(ResourceRequest request) {
        log.debug("Creating resource: {}", request.getName());

        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Resource saved = resourceRepository.save(resource);
        log.debug("Resource saved with id: {}", saved.getId());
        return toResponse(saved);
    }

    // ────────────────────────────────────────────────
    // READ ALL
    // ────────────────────────────────────────────────
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────
    // READ BY TYPE (with optional search)
    // ────────────────────────────────────────────────
    public List<ResourceResponse> getResourcesByType(String type, String keyword) {
        List<Resource> resources;
        if (keyword != null && !keyword.isBlank()) {
            resources = resourceRepository.findByTypeAndSearch(type.toUpperCase(), keyword);
        } else {
            resources = resourceRepository.findByType(type.toUpperCase());
        }
        return resources.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────
    // READ BY ID
    // ────────────────────────────────────────────────
    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return toResponse(resource);
    }

    // ────────────────────────────────────────────────
    // UPDATE
    // ────────────────────────────────────────────────
    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setAvailabilityWindows(request.getAvailabilityWindows());
        existing.setStatus(request.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        Resource updated = resourceRepository.save(existing);
        log.debug("Resource updated: {}", updated.getId());
        return toResponse(updated);
    }

    // ────────────────────────────────────────────────
    // DELETE
    // ────────────────────────────────────────────────
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        log.debug("Resource deleted: {}", id);
    }

    // ────────────────────────────────────────────────
    // MAPPER
    // ────────────────────────────────────────────────
    private ResourceResponse toResponse(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .availabilityWindows(r.getAvailabilityWindows())
                .availabilityWindowCount(r.getAvailabilityWindows() != null ? r.getAvailabilityWindows().size() : 0)
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
