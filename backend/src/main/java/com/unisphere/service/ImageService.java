package com.unisphere.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    public String uploadBase64(String base64) throws IOException {
        if (base64 == null || base64.isEmpty()) return null;
        
        // Handle data:image/jpeg;base64,... prefix
        String cleanBase64 = base64;
        if (base64.contains(",")) {
            cleanBase64 = base64.split(",")[1];
        }

        Map uploadResult = cloudinary.uploader().upload(base64, ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }
}
