package com.unisphere.dto.response;

import java.io.Serializable;
import java.util.List;

public class NotificationPageResponse implements Serializable {

    private List<NotificationResponse> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;

    public List<NotificationResponse> getContent() {
        return content;
    }

    public void setContent(List<NotificationResponse> content) {
        this.content = content;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
