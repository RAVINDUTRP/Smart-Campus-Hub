package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.UserProfileResponse;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String DEFAULT_EMAIL = "student1@smartcampus.local";

    private final boolean oauth2Enabled;

    public AuthController(@Value("${app.security.oauth2.enabled:false}") boolean oauth2Enabled) {
        this.oauth2Enabled = oauth2Enabled;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestHeader(value = "X-User-Roles", required = false) String headerRoles
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);

        String email = isAuthenticated
                ? normalizeEmail(authentication.getName(), DEFAULT_EMAIL)
                : normalizeEmail(headerEmail, DEFAULT_EMAIL);

        Set<String> roleSet = new LinkedHashSet<>();
        if (isAuthenticated) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                String authorityName = authority.getAuthority();
                if (authorityName == null || authorityName.isBlank()) {
                    continue;
                }
                if (authorityName.startsWith("ROLE_")) {
                    roleSet.add(authorityName.substring(5));
                } else {
                    roleSet.add(authorityName);
                }
            }
        } else if (headerRoles != null && !headerRoles.isBlank()) {
            for (String token : headerRoles.split(",")) {
                if (!token.isBlank()) {
                    roleSet.add(token.trim().toUpperCase(Locale.ROOT));
                }
            }
        }

        if (roleSet.isEmpty()) {
            roleSet.add("USER");
        }

        UserProfileResponse profile = new UserProfileResponse();
        profile.setEmail(email);
        profile.setDisplayName(buildDisplayName(email));
        profile.setRoles(new ArrayList<>(roleSet));
        profile.setAuthenticated(isAuthenticated);
        profile.setOauth2Enabled(oauth2Enabled);
        return ResponseEntity.ok(profile);
    }

    private String normalizeEmail(String input, String fallback) {
        if (input == null || input.isBlank()) {
            return fallback;
        }
        return input.trim().toLowerCase(Locale.ROOT);
    }

    private String buildDisplayName(String email) {
        String localPart = email.split("@")[0];
        String[] words = localPart.replace('.', ' ').replace('_', ' ').split("\\s+");
        List<String> transformed = new ArrayList<>();
        for (String word : words) {
            if (word.isBlank()) {
                continue;
            }
            transformed.add(word.substring(0, 1).toUpperCase(Locale.ROOT) + word.substring(1));
        }
        return transformed.isEmpty() ? "Campus User" : String.join(" ", transformed);
    }
}