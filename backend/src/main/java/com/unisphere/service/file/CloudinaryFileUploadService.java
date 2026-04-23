package com.unisphere.service.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryFileUploadService implements FileUploadService {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile multipartFile) throws IOException {
        String publicId = "unisphere_profile_" + UUID.randomUUID().toString();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(multipartFile.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "folder", "unisphere/profiles"
                ));
        
        return uploadResult.get("secure_url").toString();
    }

    @Override
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
