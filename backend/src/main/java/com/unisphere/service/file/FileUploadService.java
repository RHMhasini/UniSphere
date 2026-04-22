package com.unisphere.service.file;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileUploadService {
    String uploadFile(MultipartFile multipartFile) throws IOException;
    void deleteFile(String publicId) throws IOException;
}
