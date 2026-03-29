package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.Booking;
import com.smartcampus.operationshub.entity.BookingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    boolean existsByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            Long resourceId,
            Collection<BookingStatus> statuses,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByIdNotAndResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            Long id,
            Long resourceId,
            Collection<BookingStatus> statuses,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    List<Booking> findByRequesterEmailOrderByCreatedAtDesc(String requesterEmail);
}