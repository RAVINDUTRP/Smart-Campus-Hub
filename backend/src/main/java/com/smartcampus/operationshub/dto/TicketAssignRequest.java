package com.smartcampus.operationshub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class TicketAssignRequest {

    @NotBlank(message = "Technician email is required")
    @Email(message = "Technician email must be valid")
    private String technicianEmail;

    public String getTechnicianEmail() {
        return technicianEmail;
    }

    public void setTechnicianEmail(String technicianEmail) {
        this.technicianEmail = technicianEmail;
    }
}