package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    List<Notification> findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(String recipientEmail);

    Optional<Notification> findByIdAndRecipientEmail(Long id, String recipientEmail);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);
}