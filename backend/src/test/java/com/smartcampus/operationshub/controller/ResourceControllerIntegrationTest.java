package com.smartcampus.operationshub.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.operationshub.dto.ResourceRequest;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
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
class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createAndFilterResources_shouldReturnCreatedData() throws Exception {
        ResourceRequest request = new ResourceRequest();
        request.setName("Lab C-03");
        request.setType(ResourceType.LAB);
        request.setCapacity(35);
        request.setLocation("Building C - Floor 1");
        request.setStatus(ResourceStatus.ACTIVE);

        mockMvc.perform(post("/api/v1/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Lab C-03"));

        mockMvc.perform(get("/api/v1/resources")
                        .param("type", "LAB")
                        .param("location", "Building C"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("LAB"));
    }

    @Test
    void createResource_shouldReturnBadRequestForInvalidPayload() throws Exception {
        ResourceRequest request = new ResourceRequest();
        request.setName(" ");
        request.setType(ResourceType.MEETING_ROOM);
        request.setCapacity(0);
        request.setLocation(" ");
        request.setStatus(ResourceStatus.ACTIVE);

        mockMvc.perform(post("/api/v1/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.capacity").exists());
    }
}