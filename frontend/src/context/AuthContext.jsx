import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
	clearLocalAuthProfile,
	fetchCurrentUser,
	getDefaultLoginUrl,
	getDefaultLogoutUrl,
	getLocalAuthProfile,
	setLocalAuthProfile
} from "../features/auth/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [profile, setProfile] = useState(null);
	const [localSession, setLocalSession] = useState(() => getLocalAuthProfile());
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [error, setError] = useState("");

	const refreshProfile = useCallback(async () => {
		setIsLoadingProfile(true);
		try {
			const data = await fetchCurrentUser();
			setProfile(data);
			setLocalSession(getLocalAuthProfile());
			setError("");
			return data;
		} catch (requestError) {
			setProfile(null);
			setLocalSession(getLocalAuthProfile());
			setError(requestError?.message || "Unable to load current user profile.");
			return null;
		} finally {
			setIsLoadingProfile(false);
		}
	}, []);

	useEffect(() => {
		refreshProfile();
	}, [refreshProfile]);

	const oauth2Enabled = Boolean(profile?.oauth2Enabled);
	const roles = oauth2Enabled ? profile?.roles || [] : localSession?.roles || [];
	const isAuthenticated = oauth2Enabled ? Boolean(profile?.authenticated) : Boolean(localSession?.email);

	const signInLocal = useCallback(
		async ({ email, roles: selectedRoles }) => {
			const normalizedEmail = String(email || "").trim().toLowerCase();
			const normalizedRoles = Array.from(new Set((selectedRoles || ["USER"]).map((role) => String(role).trim().toUpperCase())));
			setLocalAuthProfile({ email: normalizedEmail, roles: normalizedRoles });
			setLocalSession({ email: normalizedEmail, roles: normalizedRoles });
			return refreshProfile();
		},
		[refreshProfile]
	);

	const signOutLocal = useCallback(async () => {
		clearLocalAuthProfile();
		setLocalSession(null);
		setProfile(null);
		return refreshProfile();
	}, [refreshProfile]);

	const value = useMemo(
		() => ({
			profile,
			roles,
			error,
			isLoadingProfile,
			oauth2Enabled,
			isAuthenticated,
			loginUrl: profile?.loginUrl || getDefaultLoginUrl(),
			logoutUrl: profile?.logoutUrl || getDefaultLogoutUrl(),
			refreshProfile,
			signInLocal,
			signOutLocal,
			hasRole: (role) => roles.includes(role),
			hasAnyRole: (candidateRoles = []) => candidateRoles.some((role) => roles.includes(role))
		}),
		[profile, roles, error, isLoadingProfile, oauth2Enabled, isAuthenticated, refreshProfile, signInLocal, signOutLocal]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider.");
	}
	return context;
}
