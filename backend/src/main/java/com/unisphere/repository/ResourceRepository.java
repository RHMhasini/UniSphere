package com.unisphere.repository;

import com.unisphere.entity.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    /** Find all resources by type (e.g. LECTURE_HALL, LAB, etc.) */
    List<Resource> findByType(String type);

    /** Find by type and search across name, location */
    @Query("{ 'type': ?0, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'location': { $regex: ?1, $options: 'i' } } ] }")
    List<Resource> findByTypeAndSearch(String type, String keyword);

    /** Find all by status */
    List<Resource> findByStatus(String status);
}
