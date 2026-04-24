package com.unisphere.repository;

import com.unisphere.entity.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    /** * Find all resources by type (e.g. LECTURE_HALL, LAB, etc.) 
     * Spring Data MongoDB will automatically implement this based on the name.
     */
    List<Resource> findByTypeIgnoreCase(String type);

    /** * Find by type and search across name or location using MongoDB Regex.
     * ?0 refers to the type, ?1 refers to the keyword.
     * $options: 'i' makes the search case-insensitive.
     */
    @Query("{ 'type': ?0, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'location': { $regex: ?1, $options: 'i' } } ] }")
    List<Resource> findByTypeAndSearch(String type, String keyword);

    /** Find all by status (e.g., ACTIVE, OUT_OF_SERVICE) */
    List<Resource> findByStatusIgnoreCase(String status);
}