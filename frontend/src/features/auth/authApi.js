import httpClient from "../../api/httpClient";

const LOCAL_AUTH_STORAGE_KEY = "smartcampus.localAuthProfile";

function getNormalizedAuthBaseUrl() {
	const configured = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8080";
	return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

export function getDefaultLoginUrl() {
	const registrationId = import.meta.env.VITE_OAUTH2_REGISTRATION_ID || "google";
	return `${getNormalizedAuthBaseUrl()}/oauth2/authorization/${registrationId}`;
}

export function getDefaultLogoutUrl() {
	return `${getNormalizedAuthBaseUrl()}/logout`;
}

export function getLocalAuthProfile() {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		const raw = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw);
		if (!parsed?.email) {
			return null;
		}
		const roles = Array.isArray(parsed.roles) ? parsed.roles : ["USER"];
		return {
			email: String(parsed.email).trim().toLowerCase(),
			roles: roles.map((role) => String(role).trim().toUpperCase()).filter(Boolean)
		};
	} catch (_error) {
		return null;
	}
}

export function setLocalAuthProfile(profile) {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(profile));
}

export function clearLocalAuthProfile() {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
}

export function getLocalAuthHeaders() {
	const localProfile = getLocalAuthProfile();
	if (!localProfile?.email) {
		return {};
	}
	return {
		"X-User-Email": localProfile.email,
		"X-User-Roles": (localProfile.roles || []).join(",")
	};
}

export async function fetchCurrentUser(headers = {}) {
	const response = await httpClient.get("/auth/me", {
		headers: {
			...getLocalAuthHeaders(),
			...headers
		}
	});
	return response.data;
}
