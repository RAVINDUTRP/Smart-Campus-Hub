package com.smartcampus.operationshub.validation;

import com.smartcampus.operationshub.entity.BookingStatus;
import jakarta.validation.constraints.Email;

public class BookingFilter {

    private Long resourceId;
    private BookingStatus status;

    @Email(message = "Requester email must be valid")
    private String requesterEmail;

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }
}