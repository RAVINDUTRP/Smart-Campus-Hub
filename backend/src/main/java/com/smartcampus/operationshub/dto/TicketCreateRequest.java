package com.smartcampus.operationshub.dto;

import com.smartcampus.operationshub.entity.TicketPriority;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TicketCreateRequest {

    @NotBlank(message = "Category is required")
    @Size(max = 150, message = "Category must be at most 150 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private Long resourceId;

    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    @NotBlank(message = "Requester email is required")
    @Email(message = "Requester email must be valid")
    private String requesterEmail;

    @NotBlank(message = "Preferred contact is required")
    @Size(max = 150, message = "Preferred contact must be at most 150 characters")
    private String preferredContact;

    @AssertTrue(message = "Either resourceId or location must be provided")
    public boolean isResourceOrLocationPresent() {
        return resourceId != null || (location != null && !location.isBlank());
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getPreferredContact() {
        return preferredContact;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
    }
}