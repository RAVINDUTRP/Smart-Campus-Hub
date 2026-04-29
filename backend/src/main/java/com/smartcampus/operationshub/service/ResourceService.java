package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.ResourceRequest;
import com.smartcampus.operationshub.dto.ResourceResponse;
import com.smartcampus.operationshub.validation.ResourceFilter;
import java.util.List;

public interface ResourceService {

    ResourceResponse createResource(ResourceRequest request);

    ResourceResponse getResourceById(Long id);

    List<ResourceResponse> getResources(ResourceFilter filter);

    ResourceResponse updateResource(Long id, ResourceRequest request);

    void deleteResource(Long id);
}