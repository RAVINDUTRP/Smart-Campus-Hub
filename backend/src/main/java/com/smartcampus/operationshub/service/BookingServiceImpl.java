package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.BookingCancelRequest;
import com.smartcampus.operationshub.dto.BookingCreateRequest;
import com.smartcampus.operationshub.dto.BookingRejectRequest;
import com.smartcampus.operationshub.dto.BookingResponse;
import com.smartcampus.operationshub.entity.Booking;
import com.smartcampus.operationshub.entity.BookingStatus;
import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.exception.BookingConflictException;
import com.smartcampus.operationshub.exception.BookingNotFoundException;
import com.smartcampus.operationshub.exception.BookingStateException;
import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.repository.BookingRepository;
import com.smartcampus.operationshub.repository.ResourceRepository;
import com.smartcampus.operationshub.validation.BookingFilter;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final List<BookingStatus> CONFLICT_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingServiceImpl(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    public BookingResponse createBooking(BookingCreateRequest request) {
        Resource resource = findResource(request.getResourceId());
        validateResourceForBooking(resource, request.getExpectedAttendees());

        ensureNoOverlap(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime(),
                null,
                CONFLICT_STATUSES,
                "Booking conflict detected for selected resource and time range"
        );

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setRequesterEmail(request.getRequesterEmail().trim().toLowerCase());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return toResponse(findBooking(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String requesterEmail) {
        return bookingRepository.findByRequesterEmailOrderByCreatedAtDesc(requesterEmail.trim().toLowerCase())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookings(BookingFilter filter) {
        Specification<Booking> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getResourceId() != null) {
                predicates.add(builder.equal(root.get("resource").get("id"), filter.getResourceId()));
            }
            if (filter.getStatus() != null) {
                predicates.add(builder.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getRequesterEmail() != null && !filter.getRequesterEmail().isBlank()) {
                predicates.add(builder.equal(
                        builder.lower(root.get("requesterEmail")),
                        filter.getRequesterEmail().trim().toLowerCase()
                ));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };

        return bookingRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookingResponse approveBooking(Long id) {
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingStateException("Only pending bookings can be approved");
        }

        ensureNoOverlap(
                booking.getResource().getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId(),
                List.of(BookingStatus.APPROVED),
                "Cannot approve booking because it overlaps with an approved booking"
        );

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse rejectBooking(Long id, BookingRejectRequest request) {
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingStateException("Only pending bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getReason().trim());
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancelBooking(Long id, BookingCancelRequest request) {
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BookingStateException("Only approved bookings can be cancelled");
        }
        if (!booking.getRequesterEmail().equalsIgnoreCase(request.getRequesterEmail().trim())) {
            throw new IllegalArgumentException("Users can only cancel their own bookings");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    private Resource findResource(Long resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id: " + resourceId));
    }

    private Booking findBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found for id: " + bookingId));
    }

    private void validateResourceForBooking(Resource resource, Integer expectedAttendees) {
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException("Resource is not active for booking");
        }
        if (expectedAttendees != null && resource.getCapacity() != null && expectedAttendees > resource.getCapacity()) {
            throw new IllegalArgumentException("Expected attendees exceed resource capacity");
        }
    }

    private void ensureNoOverlap(
            Long resourceId,
            java.time.LocalDateTime startTime,
            java.time.LocalDateTime endTime,
            Long excludedId,
            List<BookingStatus> statuses,
            String message
    ) {
        boolean hasConflict;
        if (excludedId == null) {
            hasConflict = bookingRepository.existsByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                    resourceId,
                    statuses,
                    endTime,
                    startTime
            );
        } else {
            hasConflict = bookingRepository.existsByIdNotAndResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                    excludedId,
                    resourceId,
                    statuses,
                    endTime,
                    startTime
            );
        }

        if (hasConflict) {
            throw new BookingConflictException(message);
        }
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResource().getId());
        response.setResourceName(booking.getResource().getName());
        response.setRequesterEmail(booking.getRequesterEmail());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }
}