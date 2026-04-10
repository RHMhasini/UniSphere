package com.unisphere.service;

import com.unisphere.dto.ResourceRequest;
import com.unisphere.dto.ResourceResponse;
import com.unisphere.entity.Resource;
import com.unisphere.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // ── CREATE ──────────────────────────────────────
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = new Resource();
        mapRequestToEntity(request, resource);
        Resource savedResource = resourceRepository.save(resource);
        return mapToResponse(savedResource);
    }

    // ── READ (ALL) ──────────────────────────────────
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── READ (BY ID) ────────────────────────────────
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    // ── READ (BY TYPE & SEARCH) ─────────────────────
    public List<ResourceResponse> getResourcesByType(String type, String search) {
        // This is a basic filter implementation
        return resourceRepository.findAll().stream()
                .filter(r -> r.getType().equalsIgnoreCase(type))
                .filter(r -> search == null || r.getName().toLowerCase().contains(search.toLowerCase()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── UPDATE ──────────────────────────────────────
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        
        mapRequestToEntity(request, resource);
        Resource updatedResource = resourceRepository.save(resource);
        return mapToResponse(updatedResource);
    }

    // ── DELETE ──────────────────────────────────────
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    // ── HELPER METHODS (MAPPING) ────────────────────
    
    private void mapRequestToEntity(ResourceRequest request, Resource resource) {
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setStatus(request.getStatus());
    }

    private ResourceResponse mapToResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setType(resource.getType());
        response.setCapacity(resource.getCapacity());
        response.setLocation(resource.getLocation());
        response.setAvailabilityWindows(resource.getAvailabilityWindows());
        response.setStatus(resource.getStatus());
        return response;
    }
}