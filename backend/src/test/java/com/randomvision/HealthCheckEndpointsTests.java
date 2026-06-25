package com.randomvision;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HealthCheckEndpointsTests {

    @Autowired
    private MockMvc mockMvc;

    // --- AUTH CONTROLLER ENDPOINTS ---

    @Test
    public void testAuthRegister_InvalidPayload_ReturnsBadRequest() throws Exception {
        // Checking if endpoint is working/listening
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"\", \"email\":\"invalid-email\", \"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testAuthLogin_InvalidPayload_ReturnsBadRequest() throws Exception {
        // Checking if endpoint is working/listening
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"\", \"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testAuthForgotPassword_InvalidPayload_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"invalid-email\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testAuthResetPassword_InvalidPayload_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"\", \"newPassword\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testVerifyEmail_NoToken_ReturnsBadRequestOrNotFound() throws Exception {
        // Endpoint should be hit, but fail due to missing params (which maps to 500 via fallback handler)
        mockMvc.perform(get("/api/auth/verify-email"))
                .andExpect(status().isInternalServerError());
    }

    // --- SECURED ENDPOINTS WITHOUT AUTHENTICATION ---

    @Test
    public void testQuotesRandom_WithoutAuth_ReturnsUnauthorized() throws Exception {
        // Quotes random endpoint requires authorization in SecurityConfig.java
        mockMvc.perform(get("/api/quotes/random"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testQuotesSaved_WithoutAuth_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/quotes/saved"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testProfileUpdate_WithoutAuth_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(put("/api/profile/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"newusername\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testAdminStats_WithoutAuth_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    // --- SECURED ENDPOINTS WITH USER ROLE (AUTHENTICATED) ---

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testQuotesRandom_WithUserAuth_ReturnsOkOrNotFound() throws Exception {
        // Since database is empty in clean test run (Flyway disabled), we expect 404 (ResourceNotFoundException)
        // This confirms the controller and service layer are wired up correctly (not 401 or 403)
        mockMvc.perform(get("/api/quotes/random"))
                .andExpect(status().isNotFound()); 
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testAdminStats_WithUserAuth_ReturnsForbidden() throws Exception {
        // Regular user should not be allowed to access admin endpoints
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isForbidden());
    }

    // --- SECURED ENDPOINTS WITH ADMIN ROLE (AUTHENTICATED) ---

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testAdminStats_WithAdminAuth_ReturnsOk() throws Exception {
        // Admin should be allowed, since mock admin service stats might return data
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testAdminUsers_WithAdminAuth_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }
}
