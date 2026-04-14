import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const baseNavItems = [
	{ label: "Dashboard", to: "/" },
	{ label: "Catalogue", to: "/catalogue" },
	{ label: "Bookings", to: "/bookings" },
	{ label: "Tickets", to: "/tickets" },
	{ label: "Notifications", to: "/notifications" }
];

const roleLabelMap = {
	USER: "Student / User",
	TECHNICIAN: "Technician",
	ADMIN: "Administrator"
};

function AppLayout() {
	const { profile, oauth2Enabled, logoutUrl, signOutLocal } = useAuth();
	const navItems = baseNavItems;
	const [isSigningOut, setIsSigningOut] = useState(false);
	const mappedRoles = Array.isArray(profile?.roles)
		? profile.roles
			.map((role) => String(role || "").trim().toUpperCase())
			.filter((role) => roleLabelMap[role])
			.map((role) => roleLabelMap[role])
		: [];
	const displayRoles = mappedRoles.length > 0 ? mappedRoles : profile?.email ? [roleLabelMap.USER] : [];

	async function handleSignOut() {
		if (isSigningOut) {
			return;
		}

		setIsSigningOut(true);
		try {
			await signOutLocal({ skipRefresh: true });
			if (oauth2Enabled) {
				window.location.replace(logoutUrl);
				return;
			}
			window.location.replace("/login");
		} catch (_error) {
			window.location.replace("/login");
		}
	}

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<h1>Smart Campus Hub</h1>
				{profile && (
					<div className="profile-card">
						<p className="profile-email">{profile.email}</p>
						{displayRoles.length > 0 && (
							<p className="profile-roles">{displayRoles.join(" • ")}</p>
						)}
					</div>
				)}
				<nav>
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
						>
							{item.label}
						</NavLink>
					))}
				</nav>
				<div className="sidebar-auth-actions">
					<button type="button" className="ghost-btn" onClick={handleSignOut} disabled={isSigningOut}>
						{isSigningOut ? "Signing out..." : "Sign out"}
					</button>
				</div>
			</aside>
			<main className="content">
				<Outlet />
			</main>
		</div>
	);
}

export default AppLayout;
