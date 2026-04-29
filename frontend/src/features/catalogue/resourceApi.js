import httpClient from "../../api/httpClient";

function cleanParams(filters) {
	const entries = Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined);
	return Object.fromEntries(entries);
}

export async function fetchResources(filters) {
	const response = await httpClient.get("/resources", {
		params: cleanParams(filters)
	});
	return response.data;
}

export async function createResource(payload) {
	const response = await httpClient.post("/resources", payload);
	return response.data;
}

export async function updateResource(id, payload) {
	const response = await httpClient.put(`/resources/${id}`, payload);
	return response.data;
}

export async function deleteResource(id) {
	await httpClient.delete(`/resources/${id}`);
}