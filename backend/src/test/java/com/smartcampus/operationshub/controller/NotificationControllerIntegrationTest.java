package com.smartcampus.operationshub.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smartcampus.operationshub.entity.Notification;
import com.smartcampus.operationshub.entity.NotificationType;
import com.smartcampus.operationshub.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class NotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void listAndMarkRead_shouldUpdateUnreadSummary() throws Exception {
        Notification notification = new Notification();
        notification.setRecipientEmail("student1@smartcampus.local");
        notification.setType(NotificationType.BOOKING_APPROVED);
        notification.setTitle("Booking approved");
        notification.setMessage("Booking #1 has been approved.");
        notification.setReferenceType("BOOKING");
        notification.setReferenceId(1L);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);

        mockMvc.perform(get("/api/v1/notifications")
                        .param("recipientEmail", "student1@smartcampus.local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(saved.getId()))
                .andExpect(jsonPath("$[0].read").value(false));

        mockMvc.perform(patch("/api/v1/notifications/{id}/read", saved.getId())
                        .param("recipientEmail", "student1@smartcampus.local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true))
                .andExpect(jsonPath("$.readAt").exists());

        mockMvc.perform(get("/api/v1/notifications/summary")
                        .param("recipientEmail", "student1@smartcampus.local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));
    }

    @Test
    void authMe_shouldReturnHeaderBasedProfileWhenOauthDisabled() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("X-User-Email", "admin@smartcampus.local")
                        .header("X-User-Roles", "ADMIN,USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@smartcampus.local"))
                .andExpect(jsonPath("$.displayName").value("Admin"))
                .andExpect(jsonPath("$.roles[0]").exists())
                .andExpect(jsonPath("$.authenticated").value(false));
    }
}