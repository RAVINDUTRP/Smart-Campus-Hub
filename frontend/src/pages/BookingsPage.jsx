import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
	approveBooking,
	cancelBooking,
	createBooking,
	fetchBookings,
	fetchMyBookings,
	rejectBooking
} from "../features/bookings/bookingApi";
import { fetchResources } from "../features/catalogue/resourceApi";

const bookingStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const initialBookingForm = {
	resourceId: "",
	requesterEmail: "",
	startTime: "",
	endTime: "",
	purpose: "",
	expectedAttendees: ""
};

const initialAdminFilters = {
	resourceId: "",
	status: "",
	requesterEmail: ""
};

function getErrorMessage(error) {
	const apiError = error?.response?.data;
	if (apiError?.validationErrors) {
		const firstValidation = Object.values(apiError.validationErrors)[0];
		if (firstValidation) {
			return firstValidation;
		}
	}
	return apiError?.message || error.message || "Request failed";
}

function toDateTimeLabel(value) {
	if (!value) {
		return "-";
	}
	return value.replace("T", " ").slice(0, 16);
}

function BookingsPage() {
	const { profile, hasRole } = useAuth();
	const isAdmin = hasRole("ADMIN");
	const [bookingForm, setBookingForm] = useState(initialBookingForm);
	const [adminFilters, setAdminFilters] = useState(initialAdminFilters);
	const [myBookings, setMyBookings] = useState([]);
	const [adminBookings, setAdminBookings] = useState([]);
	const [availableResources, setAvailableResources] = useState([]);
	const [feedback, setFeedback] = useState({ type: "", text: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingMy, setIsLoadingMy] = useState(false);
	const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
	const [isLoadingResources, setIsLoadingResources] = useState(false);

	const canSubmit = useMemo(
		() =>
			bookingForm.resourceId &&
			(profile?.email || bookingForm.requesterEmail) &&
			bookingForm.startTime &&
			bookingForm.endTime &&
			bookingForm.purpose,
		[bookingForm, profile]
	);

	const selectedResource = useMemo(
		() => availableResources.find((resource) => String(resource.id) === String(bookingForm.resourceId)) || null,
		[availableResources, bookingForm.resourceId]
	);

	useEffect(() => {
		if (!profile?.email) {
			return;
		}
		setBookingForm((prev) => ({ ...prev, requesterEmail: profile.email }));
	}, [profile]);

	useEffect(() => {
		loadAvailableResources();
	}, []);

	function onBookingFormChange(event) {
		const { name, value } = event.target;
		setBookingForm((prev) => ({ ...prev, [name]: value }));
	}

	function onAdminFilterChange(event) {
		const { name, value } = event.target;
		setAdminFilters((prev) => ({ ...prev, [name]: value }));
	}

	async function loadAvailableResources() {
		try {
			setIsLoadingResources(true);
			const data = await fetchResources({ status: "ACTIVE" });
			setAvailableResources(Array.isArray(data) ? data : []);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsLoadingResources(false);
		}
	}

	async function handleCreateBooking(event) {
		event.preventDefault();
		setFeedback({ type: "", text: "" });

		const payload = {
			resourceId: Number(bookingForm.resourceId),
			requesterEmail: profile?.email || bookingForm.requesterEmail,
			startTime: `${bookingForm.startTime}:00`,
			endTime: `${bookingForm.endTime}:00`,
			purpose: bookingForm.purpose,
			expectedAttendees: bookingForm.expectedAttendees ? Number(bookingForm.expectedAttendees) : null
		};

		try {
			setIsSubmitting(true);
			await createBooking(payload);
			setFeedback({ type: "success", text: "Booking request submitted as PENDING." });
			await loadMyBookings(payload.requesterEmail);
			if (isAdmin) {
				await loadAdminBookings(adminFilters);
			}
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsSubmitting(false);
		}
	}

	async function loadMyBookings(requesterEmail = profile?.email || bookingForm.requesterEmail) {
		if (!requesterEmail) {
			setFeedback({ type: "error", text: "Requester email is required to load your bookings." });
			return;
		}
		try {
			setIsLoadingMy(true);
			const data = await fetchMyBookings(requesterEmail);
			setMyBookings(data);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsLoadingMy(false);
		}
	}

	async function loadAdminBookings(filters = adminFilters) {
		try {
			setIsLoadingAdmin(true);
			const payload = {
				...filters,
				resourceId: filters.resourceId ? Number(filters.resourceId) : ""
			};
			const data = await fetchBookings(payload);
			setAdminBookings(data);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsLoadingAdmin(false);
		}
	}

	async function handleApprove(id) {
		if (!isAdmin) {
			return;
		}
		try {
			await approveBooking(id);
			setFeedback({ type: "success", text: `Booking ${id} approved.` });
			await loadAdminBookings(adminFilters);
			await loadMyBookings();
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleReject(id) {
		if (!isAdmin) {
			return;
		}
		const reason = window.prompt("Rejection reason:");
		if (!reason) {
			return;
		}

		try {
			await rejectBooking(id, reason);
			setFeedback({ type: "success", text: `Booking ${id} rejected.` });
			await loadAdminBookings(adminFilters);
			await loadMyBookings();
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleCancel(id) {
		try {
			await cancelBooking(id, profile?.email || bookingForm.requesterEmail);
			setFeedback({ type: "success", text: `Booking ${id} cancelled.` });
			await loadMyBookings();
			if (isAdmin) {
				await loadAdminBookings(adminFilters);
			}
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleAdminFilterSubmit(event) {
		event.preventDefault();
		await loadAdminBookings(adminFilters);
	}

	return (
		<section>
			<header className="section-header">
				<h2>Booking Management</h2>
				<p>Create booking requests, track your bookings, and process approvals.</p>
			</header>

			<div className="catalogue-grid">
				<article className="panel-card">
					<h3>Create Booking Request</h3>
					<form className="form-grid" onSubmit={handleCreateBooking}>
						<label>
							<span>Resource</span>
							<select
								name="resourceId"
								value={bookingForm.resourceId}
								onChange={onBookingFormChange}
								required
							>
								<option value="">
									{isLoadingResources ? "Loading available resources..." : "Select an available resource"}
								</option>
								{availableResources.map((resource) => (
									<option key={resource.id} value={resource.id}>
										#{resource.id} - {resource.name} ({resource.location || "No location"})
									</option>
								))}
							</select>
							<small className="booking-resource-hint">
								{selectedResource
									? `Selected: ${selectedResource.name} | Capacity ${selectedResource.capacity || "-"}`
									: "Choose from active resources. ID is selected automatically."}
							</small>
						</label>

						<label>
							<span>Requester Email</span>
							<input
								name="requesterEmail"
								value={profile?.email || bookingForm.requesterEmail}
								type="email"
								readOnly
							/>
						</label>

						<div className="time-row">
							<label>
								<span>Start</span>
								<input
									name="startTime"
									value={bookingForm.startTime}
									onChange={onBookingFormChange}
									type="datetime-local"
									required
								/>
							</label>
							<label>
								<span>End</span>
								<input
									name="endTime"
									value={bookingForm.endTime}
									onChange={onBookingFormChange}
									type="datetime-local"
									required
								/>
							</label>
						</div>

						<label>
							<span>Purpose</span>
							<input name="purpose" value={bookingForm.purpose} onChange={onBookingFormChange} required />
						</label>

						<label>
							<span>Expected Attendees</span>
							<input
								name="expectedAttendees"
								value={bookingForm.expectedAttendees}
								onChange={onBookingFormChange}
								type="number"
								min="1"
							/>
						</label>

						<div className="form-actions">
							<button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? "Submitting..." : "Submit Booking"}
							</button>
							<button type="button" className="ghost-btn" onClick={loadAvailableResources}>
								Refresh Resources
							</button>
							<button type="button" className="ghost-btn" onClick={() => loadMyBookings()}>
								Refresh My Bookings
							</button>
						</div>
					</form>
				</article>

				{isAdmin && (
					<article className="panel-card">
						<h3>Admin Review Filters</h3>
						<form className="filter-grid" onSubmit={handleAdminFilterSubmit}>
						<label>
							<span>Resource ID</span>
							<input
								name="resourceId"
								value={adminFilters.resourceId}
								onChange={onAdminFilterChange}
								type="number"
								min="1"
							/>
						</label>
						<label>
							<span>Status</span>
							<select name="status" value={adminFilters.status} onChange={onAdminFilterChange}>
								<option value="">All</option>
								{bookingStatuses.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</label>
						<label>
							<span>Requester Email</span>
							<input
								name="requesterEmail"
								value={adminFilters.requesterEmail}
								onChange={onAdminFilterChange}
								type="email"
							/>
						</label>
							<div className="form-actions">
								<button type="submit">Load Bookings</button>
								<button type="button" className="ghost-btn" onClick={() => loadAdminBookings({})}>
									Load All
								</button>
							</div>
						</form>
					</article>
				)}
			</div>

			{feedback.text && (
				<p className={feedback.type === "error" ? "feedback error" : "feedback success"}>{feedback.text}</p>
			)}

			<article className="panel-card">
				<div className="table-header">
					<h3>My Bookings</h3>
					<span>{myBookings.length} item(s)</span>
				</div>
				{isLoadingMy ? (
					<p>Loading your bookings...</p>
				) : myBookings.length === 0 ? (
					<p>No bookings found. Submit a request first.</p>
				) : (
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Resource</th>
									<th>Time</th>
									<th>Status</th>
									<th>Purpose</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{myBookings.map((booking) => (
									<tr key={booking.id}>
										<td>{booking.id}</td>
										<td>{booking.resourceName} (#{booking.resourceId})</td>
										<td>
											{toDateTimeLabel(booking.startTime)} - {toDateTimeLabel(booking.endTime)}
										</td>
										<td>{booking.status}</td>
										<td>{booking.purpose}</td>
										<td>
											{booking.status === "APPROVED" ? (
												<button type="button" className="small-btn danger" onClick={() => handleCancel(booking.id)}>
													Cancel
												</button>
											) : (
												<span>-</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</article>

			{isAdmin && (
				<article className="panel-card" style={{ marginTop: "16px" }}>
				<div className="table-header">
					<h3>Admin Booking Queue</h3>
					<span>{adminBookings.length} item(s)</span>
				</div>
				{isLoadingAdmin ? (
					<p>Loading admin queue...</p>
				) : adminBookings.length === 0 ? (
					<p>No bookings found. Use filters and click Load Bookings.</p>
				) : (
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Requester</th>
									<th>Resource</th>
									<th>Time</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{adminBookings.map((booking) => (
									<tr key={booking.id}>
										<td>{booking.id}</td>
										<td>{booking.requesterEmail}</td>
										<td>{booking.resourceName}</td>
										<td>{toDateTimeLabel(booking.startTime)}</td>
										<td>{booking.status}</td>
										<td className="actions-cell">
											{booking.status === "PENDING" ? (
												<>
													<button type="button" className="small-btn" onClick={() => handleApprove(booking.id)}>
														Approve
													</button>
													<button
														type="button"
														className="small-btn danger"
														onClick={() => handleReject(booking.id)}
													>
														Reject
													</button>
												</>
											) : (
												<span>-</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				</article>
			)}
		</section>
	);
}

export default BookingsPage;
