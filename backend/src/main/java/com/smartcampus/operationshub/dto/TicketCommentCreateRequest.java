package com.smartcampus.operationshub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketCommentCreateRequest {

    @NotBlank(message = "Author email is required")
    @Email(message = "Author email must be valid")
    private String authorEmail;

    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    private String content;

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}