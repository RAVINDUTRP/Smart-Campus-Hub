package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.ResourceRequest;
import com.smartcampus.operationshub.dto.ResourceResponse;
import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.repository.ResourceRepository;
import com.smartcampus.operationshub.validation.ResourceFilter;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = toEntity(request, new Resource());
        Resource saved = resourceRepository.save(resource);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        Resource resource = findByIdOrThrow(id);
        return toResponse(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> getResources(ResourceFilter filter) {
        validateCapacityRange(filter);

        Specification<Resource> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getType() != null) {
                predicates.add(builder.equal(root.get("type"), filter.getType()));
            }
            if (filter.getStatus() != null) {
                predicates.add(builder.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getLocation() != null && !filter.getLocation().isBlank()) {
                predicates.add(builder.like(
                        builder.lower(root.get("location")),
                        "%" + filter.getLocation().trim().toLowerCase() + "%"
                ));
            }
            if (filter.getMinCapacity() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("capacity"), filter.getMinCapacity()));
            }
            if (filter.getMaxCapacity() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("capacity"), filter.getMaxCapacity()));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };

        return resourceRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource existing = findByIdOrThrow(id);
        Resource updated = toEntity(request, existing);
        Resource saved = resourceRepository.save(updated);
        return toResponse(saved);
    }

    @Override
    public void deleteResource(Long id) {
        Resource existing = findByIdOrThrow(id);
        resourceRepository.delete(existing);
    }

    private Resource findByIdOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id: " + id));
    }

    private void validateCapacityRange(ResourceFilter filter) {
        if (filter.getMinCapacity() != null
                && filter.getMaxCapacity() != null
                && filter.getMinCapacity() > filter.getMaxCapacity()) {
            throw new IllegalArgumentException("Minimum capacity cannot be greater than maximum capacity");
        }
    }

    private Resource toEntity(ResourceRequest request, Resource resource) {
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setStatus(request.getStatus());
        resource.setAvailabilityDays(request.getAvailabilityDays());
        resource.setAvailabilityStart(request.getAvailabilityStart());
        resource.setAvailabilityEnd(request.getAvailabilityEnd());
        return resource;
    }

    private ResourceResponse toResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setType(resource.getType());
        response.setCapacity(resource.getCapacity());
        response.setLocation(resource.getLocation());
        response.setStatus(resource.getStatus());
        response.setAvailabilityDays(resource.getAvailabilityDays());
        response.setAvailabilityStart(resource.getAvailabilityStart());
        response.setAvailabilityEnd(resource.getAvailabilityEnd());
        response.setCreatedAt(resource.getCreatedAt());
        return response;
    }
}