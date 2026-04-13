package com.smartcampus.operationshub.controller;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.operationshub.dto.AuthLoginRequest;
import com.smartcampus.operationshub.dto.AuthSessionResponse;
import com.smartcampus.operationshub.dto.AuthSignupRequest;
import com.smartcampus.operationshub.dto.UserProfileResponse;
import com.smartcampus.operationshub.entity.AppUser;
import com.smartcampus.operationshub.security.OAuth2RoleService;
import com.smartcampus.operationshub.service.CredentialAuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String DEFAULT_EMAIL = "student1@smartcampus.local";
    private static final String GUEST_EMAIL = "guest@smartcampus.local";

    private final boolean oauth2Enabled;
    private final String oauth2RegistrationId;
    private final String backendBaseUrl;
    private final OAuth2RoleService oauth2RoleService;
    private final CredentialAuthService credentialAuthService;

    public AuthController(
            @Value("${app.security.oauth2.enabled:false}") boolean oauth2Enabled,
            @Value("${app.security.oauth2.registration-id:google}") String oauth2RegistrationId,
            @Value("${app.security.oauth2.backend-base-url:http://localhost:8080}") String backendBaseUrl,
            OAuth2RoleService oauth2RoleService,
            CredentialAuthService credentialAuthService
    ) {
        this.oauth2Enabled = oauth2Enabled;
        this.oauth2RegistrationId = oauth2RegistrationId;
        this.backendBaseUrl = backendBaseUrl;
        this.oauth2RoleService = oauth2RoleService;
        this.credentialAuthService = credentialAuthService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthSessionResponse> signup(@Valid @RequestBody AuthSignupRequest request) {
        if (oauth2Enabled) {
            throw new IllegalArgumentException("Local signup is disabled while OAuth2 mode is enabled.");
        }
        return ResponseEntity.ok(credentialAuthService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthSessionResponse> login(@Valid @RequestBody AuthLoginRequest request) {
        if (oauth2Enabled) {
            throw new IllegalArgumentException("Local login is disabled while OAuth2 mode is enabled.");
        }
        return ResponseEntity.ok(credentialAuthService.login(request));
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

        String email;
        if (isAuthenticated) {
            email = resolveAuthenticatedEmail(authentication);
        } else if (!oauth2Enabled) {
            email = normalizeEmail(headerEmail, GUEST_EMAIL);
        } else {
            email = GUEST_EMAIL;
        }

        Optional<AppUser> localUser = oauth2Enabled ? Optional.empty() : credentialAuthService.findByEmail(email);

        Set<String> roleSet = new LinkedHashSet<>();
        if (isAuthenticated && authentication != null && authentication.getAuthorities() != null) {
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
        } else if (!oauth2Enabled && localUser.isPresent()) {
            roleSet.addAll(credentialAuthService.resolveRoleHierarchy(localUser.get().getRole()));
        } else if (!oauth2Enabled && headerRoles != null && !headerRoles.isBlank()) {
            for (String token : headerRoles.split(",")) {
                if (!token.isBlank()) {
                    roleSet.add(token.trim().toUpperCase(Locale.ROOT));
                }
            }
        }

        if (roleSet.isEmpty() && (isAuthenticated || !GUEST_EMAIL.equals(email))) {
            roleSet.add("USER");
        }

        boolean locallyAuthenticated = !oauth2Enabled && localUser.isPresent();

        UserProfileResponse profile = new UserProfileResponse();
        profile.setEmail(email);
        profile.setDisplayName(buildDisplayName(email));
        profile.setRoles(new ArrayList<>(roleSet));
        profile.setAuthenticated(isAuthenticated || locallyAuthenticated);
        profile.setOauth2Enabled(oauth2Enabled);
        profile.setLoginUrl(buildLoginUrl());
        profile.setLogoutUrl(buildLogoutUrl());
        return ResponseEntity.ok(profile);
    }

    private String resolveAuthenticatedEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            return normalizeEmail(oauth2RoleService.extractEmail(oauth2User), DEFAULT_EMAIL);
        }
        return normalizeEmail(authentication.getName(), DEFAULT_EMAIL);
    }

    private String buildLoginUrl() {
        return sanitizeBaseUrl(backendBaseUrl) + "/oauth2/authorization/" + oauth2RegistrationId;
    }

    private String buildLogoutUrl() {
        return sanitizeBaseUrl(backendBaseUrl) + "/logout";
    }

    private String sanitizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8080";
        }
        String trimmed = value.trim();
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
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