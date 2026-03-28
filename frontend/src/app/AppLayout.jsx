import { NavLink, Outlet } from "react-router-dom";

const navItems = [
	{ label: "Dashboard", to: "/" },
	{ label: "Catalogue", to: "/catalogue" },
	{ label: "Bookings", to: "/bookings" },
	{ label: "Tickets", to: "/tickets" },
	{ label: "Notifications", to: "/notifications" }
];

function AppLayout() {
	return (
		<div className="app-shell">
			<aside className="sidebar">
				<h1>Smart Campus Hub</h1>
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
