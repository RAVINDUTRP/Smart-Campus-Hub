package com.smartcampus.operationshub.dto;

import java.util.List;

public class UserProfileResponse {

    private String email;
    private String displayName;
    private List<String> roles;
    private boolean authenticated;
    private boolean oauth2Enabled;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public boolean isOauth2Enabled() {
        return oauth2Enabled;
    }

    public void setOauth2Enabled(boolean oauth2Enabled) {
        this.oauth2Enabled = oauth2Enabled;
    }
}