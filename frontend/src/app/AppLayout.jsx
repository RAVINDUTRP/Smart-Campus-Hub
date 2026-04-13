import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseNavItems = [
	{ label: "Dashboard", to: "/" },
	{ label: "Catalogue", to: "/catalogue" },
	{ label: "Bookings", to: "/bookings" },
	{ label: "Tickets", to: "/tickets" },
	{ label: "Notifications", to: "/notifications" }
];

function AppLayout() {
	const { profile, oauth2Enabled, logoutUrl, signOutLocal } = useAuth();
	const navItems = baseNavItems;

	async function handleSignOut() {
		if (oauth2Enabled) {
			await signOutLocal({ skipRefresh: true });
			window.location.replace(logoutUrl);
			return;
		}
		await signOutLocal();
		window.location.assign("/login");
	}

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<h1>Smart Campus Hub</h1>
				{profile && (
					<div className="profile-card">
						<p className="profile-email">{profile.email}</p>
						{Array.isArray(profile.roles) && profile.roles.length > 0 && (
							<p className="profile-roles">{profile.roles.join(" • ")}</p>
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
					<button type="button" className="ghost-btn" onClick={handleSignOut}>
						Sign out
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
