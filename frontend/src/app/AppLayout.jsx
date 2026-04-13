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
		await signOutLocal();
		if (oauth2Enabled) {
			window.location.assign(logoutUrl);
			return;
		}
		window.location.assign("/login");
	}

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<h1>Smart Campus Hub</h1>
				{profile && (
					<div className="profile-card">
						<p className="profile-email">{profile.email}</p>
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
