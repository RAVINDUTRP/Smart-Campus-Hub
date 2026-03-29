package com.smartcampus.operationshub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BookingRejectRequest {

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 255, message = "Rejection reason must be at most 255 characters")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}