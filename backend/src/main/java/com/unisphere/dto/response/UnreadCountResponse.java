package com.unisphere.dto.response;

import java.io.Serializable;

public class UnreadCountResponse implements Serializable {

    private long count;

    public UnreadCountResponse() {
    }

    public UnreadCountResponse(long count) {
        this.count = count;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
