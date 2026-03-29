import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { fetchCurrentUser } from "../features/auth/authApi";

const navItems = [
	{ label: "Dashboard", to: "/" },
	{ label: "Catalogue", to: "/catalogue" },
	{ label: "Bookings", to: "/bookings" },
	{ label: "Tickets", to: "/tickets" },
	{ label: "Notifications", to: "/notifications" }
];

function AppLayout() {
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		let active = true;

		async function loadProfile() {
			try {
				const data = await fetchCurrentUser();
				if (active) {
					setProfile(data);
				}
			} catch (_error) {
				if (active) {
					setProfile(null);
				}
			}
		}

		loadProfile();
		return () => {
			active = false;
		};
	}, []);

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<h1>Smart Campus Hub</h1>
				{profile && (
					<div className="profile-card">
						<p className="profile-name">{profile.displayName}</p>
						<p className="profile-email">{profile.email}</p>
						<p className="profile-roles">{(profile.roles || []).join(" • ")}</p>
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
			</aside>
			<main className="content">
				<Outlet />
			</main>
		</div>
	);
}

export default AppLayout;
