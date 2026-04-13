import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
	{ label: "Student Demo", email: "student1@smartcampus.local", role: "USER" },
	{ label: "Technician Demo", email: "tech1@smartcampus.local", role: "TECHNICIAN" },
	{ label: "Admin Demo", email: "admin@smartcampus.local", role: "ADMIN" }
];

function LoginPage() {
	const { isLoadingProfile, oauth2Enabled, isAuthenticated, loginUrl, signInLocal, profile } = useAuth();
	const [email, setEmail] = useState(profile?.email && profile.email !== "guest@smartcampus.local" ? profile.email : "");
	const [role, setRole] = useState("USER");
	const [feedback, setFeedback] = useState("");

	if (isLoadingProfile) {
		return <p>Checking authentication status...</p>;
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	function handleGoogleSignIn() {
		window.location.assign(loginUrl);
	}

	async function handleLocalSignIn(event) {
		event.preventDefault();
		setFeedback("");

		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			setFeedback("Email is required.");
			return;
		}

		const roles = role === "ADMIN" ? ["USER", "ADMIN"] : role === "TECHNICIAN" ? ["USER", "TECHNICIAN"] : ["USER"];
		await signInLocal({ email: normalizedEmail, roles });
	}

	async function handleQuickLogin(account) {
		setFeedback("");
		const roles = account.role === "ADMIN"
			? ["USER", "ADMIN"]
			: account.role === "TECHNICIAN"
				? ["USER", "TECHNICIAN"]
				: ["USER"];
		await signInLocal({ email: account.email, roles });
	}

	return (
		<section>
			<h2>Sign In</h2>
			{oauth2Enabled ? (
				<>
					<p>Use Google OAuth 2.0 to sign in and continue to Smart Campus Operations Hub.</p>
					<button type="button" onClick={handleGoogleSignIn}>Sign in with Google</button>
				</>
			) : (
				<>
					<p>OAuth login is disabled. Use local demo login to continue.</p>
					<div className="form-actions" style={{ marginBottom: "10px" }}>
						{demoAccounts.map((account) => (
							<button key={account.email} type="button" className="ghost-btn" onClick={() => handleQuickLogin(account)}>
								{account.label}
							</button>
						))}
					</div>
					<p className="muted" style={{ marginTop: "0", marginBottom: "10px" }}>
						Demo emails: student1@smartcampus.local, tech1@smartcampus.local, admin@smartcampus.local
					</p>
					<form className="form-grid" onSubmit={handleLocalSignIn} style={{ maxWidth: "440px" }}>
						<label>
							<span>Email</span>
							<input
								type="email"
								placeholder="student1@smartcampus.local"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</label>
						<label>
							<span>Role</span>
							<select value={role} onChange={(event) => setRole(event.target.value)}>
								<option value="USER">USER</option>
								<option value="TECHNICIAN">TECHNICIAN</option>
								<option value="ADMIN">ADMIN</option>
							</select>
						</label>
						<div className="form-actions">
							<button type="submit">Continue</button>
						</div>
						{feedback && <p className="feedback error">{feedback}</p>}
					</form>
				</>
			)}
		</section>
	);
}

export default LoginPage;
