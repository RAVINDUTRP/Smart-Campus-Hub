package com.smartcampus.operationshub.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public class ResourceRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    @Size(max = 100, message = "Availability days must be at most 100 characters")
    private String availabilityDays;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime availabilityStart;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime availabilityEnd;

    @AssertTrue(message = "Availability start must be before availability end")
    public boolean isAvailabilityWindowValid() {
        if (availabilityStart == null || availabilityEnd == null) {
            return true;
        }
        return availabilityStart.isBefore(availabilityEnd);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getAvailabilityDays() {
        return availabilityDays;
    }

    public void setAvailabilityDays(String availabilityDays) {
        this.availabilityDays = availabilityDays;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public void setAvailabilityStart(LocalTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public void setAvailabilityEnd(LocalTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }
}