package com.unisphere.controller;

import com.unisphere.dto.ResourceRequest;
import com.unisphere.dto.ResourceResponse;
import com.unisphere.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;

    // Manual Constructor to fix Lombok issues in VS Code
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // ── POST /api/resources ─────────────────────────
    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(
            @Valid @RequestBody ResourceRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/resources ──────────────────────────
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // ── GET /api/resources/{id} ─────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // ── GET /api/resources/type/{type} ──────────────
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByType(
            @PathVariable String type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type, search));
    }

    // ── PUT /api/resources/{id} ─────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    // ── DELETE /api/resources/{id} ──────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of(
            "message", "Resource deleted successfully", 
            "id", id,
            "status", HttpStatus.OK.value()
        ));
    }
}
