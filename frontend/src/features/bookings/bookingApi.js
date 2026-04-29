import httpClient from "../../api/httpClient";

function cleanParams(filters) {
	const entries = Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined);
	return Object.fromEntries(entries);
}

export async function createBooking(payload) {
	const response = await httpClient.post("/bookings", payload);
	return response.data;
}

export async function fetchMyBookings(requesterEmail) {
	const response = await httpClient.get("/bookings/my", {
		params: { requesterEmail }
	});
	return response.data;
}

export async function fetchBookings(filters) {
	const response = await httpClient.get("/bookings", {
		params: cleanParams(filters)
	});
	return response.data;
}

export async function approveBooking(id) {
	const response = await httpClient.patch(`/bookings/${id}/approve`);
	return response.data;
}

export async function rejectBooking(id, reason) {
	const response = await httpClient.patch(`/bookings/${id}/reject`, { reason });
	return response.data;
}

export async function cancelBooking(id, requesterEmail) {
	const response = await httpClient.patch(`/bookings/${id}/cancel`, { requesterEmail });
	return response.data;
}