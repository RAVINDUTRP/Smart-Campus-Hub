import axios from "axios";

const httpClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
	withCredentials: true,
	timeout: 15000
});

export default httpClient;
