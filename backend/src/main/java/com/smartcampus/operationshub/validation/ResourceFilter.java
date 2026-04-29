package com.smartcampus.operationshub.validation;

import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import jakarta.validation.constraints.Min;

public class ResourceFilter {

    private ResourceType type;
    private ResourceStatus status;
    private String location;

    @Min(value = 1, message = "Minimum capacity must be at least 1")
    private Integer minCapacity;

    @Min(value = 1, message = "Maximum capacity must be at least 1")
    private Integer maxCapacity;

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getMinCapacity() {
        return minCapacity;
    }

    public void setMinCapacity(Integer minCapacity) {
        this.minCapacity = minCapacity;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }
}