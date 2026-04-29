package com.smartcampus.operationshub.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.operationshub.dto.BookingCancelRequest;
import com.smartcampus.operationshub.dto.BookingCreateRequest;
import com.smartcampus.operationshub.dto.BookingRejectRequest;
import com.smartcampus.operationshub.dto.ResourceRequest;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createBookingAndApprove_shouldFollowWorkflow() throws Exception {
        long resourceId = createResource("Lab WS2-01", ResourceType.LAB, 40);

        BookingCreateRequest bookingRequest = new BookingCreateRequest();
        bookingRequest.setResourceId(resourceId);
        bookingRequest.setRequesterEmail("student1@smartcampus.local");
        bookingRequest.setStartTime(LocalDateTime.of(2026, 4, 10, 10, 0));
        bookingRequest.setEndTime(LocalDateTime.of(2026, 4, 10, 12, 0));
        bookingRequest.setPurpose("Practical session");
        bookingRequest.setExpectedAttendees(35);

        String bookingJson = mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long bookingId = objectMapper.readTree(bookingJson).get("id").asLong();

        mockMvc.perform(patch("/api/v1/bookings/{id}/approve", bookingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(get("/api/v1/bookings/my").param("requesterEmail", "student1@smartcampus.local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].requesterEmail").value("student1@smartcampus.local"));
    }

    @Test
    void createBooking_shouldRejectOverlap() throws Exception {
        long resourceId = createResource("Lecture WS2-02", ResourceType.LECTURE_HALL, 120);

        BookingCreateRequest first = new BookingCreateRequest();
        first.setResourceId(resourceId);
        first.setRequesterEmail("student2@smartcampus.local");
        first.setStartTime(LocalDateTime.of(2026, 4, 11, 9, 0));
        first.setEndTime(LocalDateTime.of(2026, 4, 11, 11, 0));
        first.setPurpose("Guest lecture");
        first.setExpectedAttendees(90);

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        BookingCreateRequest overlap = new BookingCreateRequest();
        overlap.setResourceId(resourceId);
        overlap.setRequesterEmail("student3@smartcampus.local");
        overlap.setStartTime(LocalDateTime.of(2026, 4, 11, 10, 0));
        overlap.setEndTime(LocalDateTime.of(2026, 4, 11, 12, 0));
        overlap.setPurpose("Exam prep");
        overlap.setExpectedAttendees(60);

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overlap)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void rejectAndCancel_shouldEnforceStateAndOwnership() throws Exception {
        long resourceId = createResource("Meeting WS2-03", ResourceType.MEETING_ROOM, 20);

        BookingCreateRequest request = new BookingCreateRequest();
        request.setResourceId(resourceId);
        request.setRequesterEmail("owner@smartcampus.local");
        request.setStartTime(LocalDateTime.of(2026, 4, 12, 13, 0));
        request.setEndTime(LocalDateTime.of(2026, 4, 12, 14, 0));
        request.setPurpose("Team meeting");
        request.setExpectedAttendees(10);

        String created = mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long bookingId = objectMapper.readTree(created).get("id").asLong();

        BookingRejectRequest rejectRequest = new BookingRejectRequest();
        rejectRequest.setReason("Already assigned for maintenance");

        mockMvc.perform(patch("/api/v1/bookings/{id}/reject", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Already assigned for maintenance"));

        BookingCancelRequest cancelRequest = new BookingCancelRequest();
        cancelRequest.setRequesterEmail("owner@smartcampus.local");

        mockMvc.perform(patch("/api/v1/bookings/{id}/cancel", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelRequest)))
                .andExpect(status().isBadRequest());
    }

    private long createResource(String name, ResourceType type, int capacity) throws Exception {
        ResourceRequest request = new ResourceRequest();
        request.setName(name);
        request.setType(type);
        request.setCapacity(capacity);
        request.setLocation("WS2 Building");
        request.setStatus(ResourceStatus.ACTIVE);
        request.setAvailabilityDays("Weekdays");
        request.setAvailabilityStart(java.time.LocalTime.of(8, 0));
        request.setAvailabilityEnd(java.time.LocalTime.of(17, 0));

        String json = mockMvc.perform(post("/api/v1/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(json).get("id").asLong();
    }
}