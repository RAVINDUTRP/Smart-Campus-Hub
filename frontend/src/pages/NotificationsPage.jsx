import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../features/auth/authApi";
import {
	fetchNotifications,
	fetchNotificationSummary,
	markNotificationAsRead
} from "../features/notifications/notificationApi";

function formatTimestamp(value) {
	if (!value) {
		return "-";
	}
	return new Date(value).toLocaleString();
}

function getErrorMessage(error) {
	const apiError = error?.response?.data;
	return apiError?.message || error.message || "Request failed";
}

function getTypeColor(type) {
	if (!type) {
		return "#64748b";
	}

	if (type.startsWith("BOOKING")) {
		return "#2563eb";
	}

	if (type.startsWith("TICKET")) {
		return "#f59e0b";
	}

	return "#64748b";
}

function NotificationsPage() {
	const [recipientEmail, setRecipientEmail] = useState("student1@smartcampus.local");
	const [notifications, setNotifications] = useState([]);
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [feedback, setFeedback] = useState({ type: "", text: "" });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let active = true;

		async function hydrateFromProfile() {
			try {
				const profile = await fetchCurrentUser();
				if (active && profile?.email) {
					setRecipientEmail(profile.email);
				}
			} catch (_error) {
				// Keep local default when profile API is not available.
			}
		}

		hydrateFromProfile();
		return () => {
			active = false;
		};
	}, []);

	async function loadNotifications(options = {}) {
		const email = options.email ?? recipientEmail;
		const unreadFilter = options.unreadOnly ?? unreadOnly;

		if (!email) {
			setFeedback({ type: "error", text: "Recipient email is required." });
			return;
		}

		try {
			setIsLoading(true);
			setFeedback({ type: "", text: "" });
			const [list, summary] = await Promise.all([
				fetchNotifications(email, unreadFilter),
				fetchNotificationSummary(email)
			]);
			setNotifications(list);
			setUnreadCount(summary?.unreadCount || 0);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleMarkAsRead(notificationId) {
		try {
			await markNotificationAsRead(notificationId, recipientEmail);
			setFeedback({ type: "success", text: `Notification ${notificationId} marked as read.` });
			await loadNotifications();
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	return (
		<section>
			<header
				className="section-header"
				style={{
					background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
					padding: "1rem 1.25rem",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					marginBottom: "1rem"
				}}
			>
				<h2 style={{ marginBottom: "0.4rem" }}>Notifications</h2>
				<p style={{ margin: 0 }}>Review booking and ticket alerts, then mark updates as read.</p>
			</header>

			<article className="panel-card" style={{ borderRadius: "14px" }}>
				<div
					className="notifications-toolbar"
					style={{
						display: "grid",
						gridTemplateColumns: "minmax(280px, 1fr) auto auto",
						gap: "0.8rem",
						alignItems: "end"
					}}
				>
					<label style={{ display: "grid", gap: "0.35rem" }}>
						<span style={{ fontWeight: 600 }}>Recipient Email</span>
						<input
							type="email"
							value={recipientEmail}
							onChange={(event) => setRecipientEmail(event.target.value)}
							placeholder="student1@smartcampus.local"
						/>
					</label>
					<label className="checkbox-row" style={{ marginBottom: "0.4rem" }}>
						<input
							type="checkbox"
							checked={unreadOnly}
							onChange={(event) => setUnreadOnly(event.target.checked)}
						/>
						<span>Unread only</span>
					</label>
					<div className="form-actions">
						<button
							type="button"
							onClick={() => loadNotifications()}
							style={{ minWidth: "160px", fontWeight: 600 }}
						>
							Load Notifications
						</button>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "1rem",
						marginTop: "0.9rem",
						padding: "0.7rem 0.8rem",
						borderRadius: "10px",
						background: "#f8fafc",
						border: "1px solid #e2e8f0"
					}}
				>
					<p className="muted" style={{ margin: 0 }}>
						Unread count: <strong>{unreadCount}</strong>
					</p>
					<span className="status-chip">{unreadOnly ? "Showing unread only" : "Showing all"}</span>
				</div>

				{feedback.text && (
					<div
						className={feedback.type === "error" ? "feedback error" : "feedback success"}
						style={{ marginTop: "0.8rem", borderRadius: "10px", padding: "0.7rem 0.9rem" }}
					>
						{feedback.text}
					</div>
				)}

				{isLoading ? (
					<div style={{ padding: "1rem 0.2rem" }}>
						<p style={{ margin: 0, color: "#475569" }}>Loading notifications...</p>
					</div>
				) : notifications.length === 0 ? (
					<div
						style={{
							marginTop: "0.9rem",
							padding: "1rem",
							textAlign: "center",
							border: "1px dashed #cbd5e1",
							borderRadius: "12px",
							background: "#f8fafc"
						}}
					>
						<p style={{ margin: "0 0 0.3rem 0", fontWeight: 600 }}>No notifications yet</p>
						<p className="muted" style={{ margin: 0 }}>
							Trigger a booking or ticket update, then click Load Notifications.
						</p>
					</div>
				) : (
					<ul className="notification-list" style={{ marginTop: "0.9rem", display: "grid", gap: "0.75rem" }}>
						{notifications.map((notification) => (
							<li
								key={notification.id}
								className={notification.read ? "notification-item read" : "notification-item"}
								style={{
									borderLeft: `4px solid ${getTypeColor(notification.type)}`,
									borderRadius: "10px",
									padding: "0.9rem"
								}}
							>
								<div style={{ minWidth: 0 }}>
									<p className="notification-title" style={{ margin: "0 0 0.35rem 0" }}>
										{notification.title}
									</p>
									<p className="notification-message" style={{ margin: "0 0 0.45rem 0" }}>
										{notification.message}
									</p>
									<p className="notification-meta" style={{ margin: 0 }}>
										{notification.type} • {formatTimestamp(notification.createdAt)}
									</p>
								</div>
								{notification.read ? (
									<span className="status-chip active">Read</span>
								) : (
									<button
										type="button"
										className="small-btn"
										onClick={() => handleMarkAsRead(notification.id)}
									>
										Mark Read
									</button>
								)}
							</li>
						))}
					</ul>
				)}
			</article>
		</section>
	);
}

export default NotificationsPage;
