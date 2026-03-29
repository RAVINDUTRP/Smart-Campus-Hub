package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.TicketAttachment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    long countByTicketId(Long ticketId);

    List<TicketAttachment> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}