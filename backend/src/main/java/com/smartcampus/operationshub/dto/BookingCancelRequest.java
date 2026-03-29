package com.smartcampus.operationshub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class BookingCancelRequest {

    @NotBlank(message = "Requester email is required")
    @Email(message = "Requester email must be valid")
    private String requesterEmail;

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }
}