package com.unisphere.service;

import com.unisphere.dto.ResourceRequest;
import com.unisphere.dto.ResourceResponse;
import com.unisphere.entity.Resource;
import com.unisphere.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = new Resource();
        mapRequestToEntity(request, resource);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());

        Resource savedResource = resourceRepository.save(resource);
        return mapToResponse(savedResource);
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResourceResponse getResourceById(@NonNull String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        return mapToResponse(resource);
    }

    public List<ResourceResponse> getResourcesByType(String type, String search) {
        List<Resource> resources;
        if (search != null && !search.isEmpty()) {
            resources = resourceRepository.findByTypeAndSearch(type, search);
        } else {
            resources = resourceRepository.findByTypeIgnoreCase(type);
        }

        return resources.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResourceResponse updateResource(@NonNull String id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        mapRequestToEntity(request, resource);
        resource.setUpdatedAt(LocalDateTime.now());

        Resource updatedResource = resourceRepository.save(resource);
        return mapToResponse(updatedResource);
    }

    public void deleteResource(@NonNull String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(id);
    }

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
        response.setAvailabilityWindowCount(
                resource.getAvailabilityWindows() != null ? resource.getAvailabilityWindows().size() : 0
        );
        response.setStatus(resource.getStatus());
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());
        return response;
    }
}
