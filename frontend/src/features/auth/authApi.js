import httpClient from "../../api/httpClient";

export async function fetchCurrentUser(headers = {}) {
	const response = await httpClient.get("/auth/me", {
		headers
	});
	return response.data;
}
