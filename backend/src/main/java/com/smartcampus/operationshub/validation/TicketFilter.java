package com.smartcampus.operationshub.validation;

import com.smartcampus.operationshub.entity.TicketPriority;
import com.smartcampus.operationshub.entity.TicketStatus;
import jakarta.validation.constraints.Email;

public class TicketFilter {

    private TicketStatus status;
    private TicketPriority priority;

    @Email(message = "Requester email must be valid")
    private String requesterEmail;

    @Email(message = "Technician email must be valid")
    private String assignedTechnicianEmail;

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getAssignedTechnicianEmail() {
        return assignedTechnicianEmail;
    }

    public void setAssignedTechnicianEmail(String assignedTechnicianEmail) {
        this.assignedTechnicianEmail = assignedTechnicianEmail;
    }
}