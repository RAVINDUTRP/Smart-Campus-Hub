package com.smartcampus.operationshub.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
        @Value("${app.security.oauth2.enabled:false}") boolean oauth2Enabled,
        @Value("${app.security.oauth2.frontend-success-url:http://localhost:5173/}") String frontendSuccessUrl,
        OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authorizeHttpRequests(auth -> {
            auth.requestMatchers(
                "/api/v1/health",
                "/api/v1/public/**",
                "/api/v1/auth/me",
                "/h2-console/**",
                "/oauth2/**",
                "/login/**"
            ).permitAll();
                    if (oauth2Enabled) {
            auth.requestMatchers(HttpMethod.POST, "/api/v1/resources/**").hasRole("ADMIN");
            auth.requestMatchers(HttpMethod.PUT, "/api/v1/resources/**").hasRole("ADMIN");
            auth.requestMatchers(HttpMethod.DELETE, "/api/v1/resources/**").hasRole("ADMIN");
                        auth.requestMatchers(
                                "/api/v1/bookings/*/approve",
                                "/api/v1/bookings/*/reject"
                        ).hasRole("ADMIN");
                        auth.requestMatchers(
                                "/api/v1/tickets/*/assign",
                                "/api/v1/tickets/*/status",
                                "/api/v1/tickets/*/reject"
                        ).hasAnyRole("ADMIN", "TECHNICIAN");
                        auth.anyRequest().authenticated();
                    } else {
                        auth.anyRequest().permitAll();
                    }
                });

        if (oauth2Enabled) {
            http.oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo -> userInfo.userService(oauth2UserService))
                    .successHandler(frontendRedirectSuccessHandler(frontendSuccessUrl))
            );
            http.logout(logout -> logout.logoutSuccessUrl(frontendSuccessUrl));
        }

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService(OAuth2RoleService oauth2RoleService) {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

        return userRequest -> {
            OAuth2User oauth2User = delegate.loadUser(userRequest);
            String email = oauth2RoleService.extractEmail(oauth2User);

            Set<org.springframework.security.core.GrantedAuthority> authorities = new LinkedHashSet<>(oauth2User.getAuthorities());
            authorities.addAll(oauth2RoleService.resolveAuthoritiesByEmail(email));

            String configuredNameAttribute = userRequest.getClientRegistration()
                    .getProviderDetails()
                    .getUserInfoEndpoint()
                    .getUserNameAttributeName();
            String nameAttribute = chooseNameAttribute(configuredNameAttribute, oauth2User);

            return new DefaultOAuth2User(authorities, oauth2User.getAttributes(), nameAttribute);
        };
    }

    private AuthenticationSuccessHandler frontendRedirectSuccessHandler(String redirectUrl) {
        return (request, response, authentication) -> sendRedirect(response, redirectUrl);
    }

    private void sendRedirect(jakarta.servlet.http.HttpServletResponse response, String redirectUrl) throws IOException {
        String sanitized = redirectUrl == null || redirectUrl.isBlank() ? "http://localhost:5173/" : redirectUrl.trim();
        response.sendRedirect(sanitized);
    }

    private String chooseNameAttribute(String configuredNameAttribute, OAuth2User oauth2User) {
        if (configuredNameAttribute != null
                && !configuredNameAttribute.isBlank()
                && oauth2User.getAttributes().containsKey(configuredNameAttribute)) {
            return configuredNameAttribute;
        }
        if (oauth2User.getAttributes().containsKey("email")) {
            return "email";
        }
        if (oauth2User.getAttributes().containsKey("sub")) {
            return "sub";
        }
        return oauth2User.getAttributes().keySet().stream().findFirst().orElse("sub");
    }
}
