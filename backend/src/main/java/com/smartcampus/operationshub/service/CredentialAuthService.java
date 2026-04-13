package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.AuthLoginRequest;
import com.smartcampus.operationshub.dto.AuthSessionResponse;
import com.smartcampus.operationshub.dto.AuthSignupRequest;
import com.smartcampus.operationshub.entity.AppUser;
import com.smartcampus.operationshub.entity.AppUserRole;
import java.util.Optional;
import java.util.Set;

public interface CredentialAuthService {

    AuthSessionResponse signup(AuthSignupRequest request);

    AuthSessionResponse login(AuthLoginRequest request);

    Optional<AppUser> findByEmail(String email);

    Set<String> resolveRoleHierarchy(AppUserRole role);
}
