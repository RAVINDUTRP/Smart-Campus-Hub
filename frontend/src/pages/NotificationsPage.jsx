import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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

function NotificationsPage() {
	const { profile } = useAuth();
	const [recipientEmail, setRecipientEmail] = useState("");
	const [notifications, setNotifications] = useState([]);
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [feedback, setFeedback] = useState({ type: "", text: "" });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (profile?.email) {
			setRecipientEmail(profile.email);
		}
	}, [profile]);

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
			<header className="section-header">
				<h2>Notifications</h2>
				<p>Review booking and ticket alerts, then mark updates as read.</p>
			</header>

			<article className="panel-card">
				<div className="notifications-toolbar">
					<label>
						<span>Recipient Email</span>
						<input type="email" value={recipientEmail} readOnly />
					</label>
					<label className="checkbox-row">
						<input
							type="checkbox"
							checked={unreadOnly}
							onChange={(event) => setUnreadOnly(event.target.checked)}
						/>
						<span>Unread only</span>
					</label>
					<div className="form-actions">
						<button type="button" onClick={() => loadNotifications()}>
							Load Notifications
						</button>
					</div>
				</div>
				<p className="muted">Unread count: {unreadCount}</p>

				{feedback.text && (
					<p className={feedback.type === "error" ? "feedback error" : "feedback success"}>{feedback.text}</p>
				)}

				{isLoading ? (
					<p>Loading notifications...</p>
				) : notifications.length === 0 ? (
					<p>No notifications found. Trigger a booking or ticket update and reload.</p>
				) : (
					<ul className="notification-list">
						{notifications.map((notification) => (
							<li key={notification.id} className={notification.read ? "notification-item read" : "notification-item"}>
								<div>
									<p className="notification-title">{notification.title}</p>
									<p className="notification-message">{notification.message}</p>
									<p className="notification-meta">
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
