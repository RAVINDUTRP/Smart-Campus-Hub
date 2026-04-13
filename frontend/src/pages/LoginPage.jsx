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
		if (!loginUrl) {
			setFeedback("Login URL is not configured.");
			return;
		}
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
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

			<div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_1.3fr]">
				<div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 text-white sm:p-10">
					<div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">
						Smart Campus
					</div>
					<h1 className="mt-5 text-3xl font-black leading-tight">Welcome back</h1>
					<p className="mt-3 text-sm leading-relaxed text-blue-100/90">
						Sign in to manage resources, bookings, tickets, and notifications from one place.
					</p>

					<div className="mt-8 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
						<p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-blue-100/80">Access Mode</p>
						<p className="m-0 mt-1 text-sm text-white">
							{oauth2Enabled ? "Secure OAuth sign-in is enabled." : "Local demo sign-in is enabled for development."}
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-blue-100">Fast access</span>
							<span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-blue-100">Role ready</span>
							<span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-blue-100">Campus secure</span>
						</div>
					</div>
				</div>

				<div className="flex items-center p-8 sm:p-10">
					<div className="mx-auto w-full max-w-xl">
					<h2 className="m-0 text-2xl font-black tracking-tight text-slate-900">Sign In</h2>
					<p className="mt-2 text-sm text-slate-500">
						{oauth2Enabled
							? "Use your Google account to continue securely."
							: "Use quick demo access or enter an email and role to continue."}
					</p>

					{oauth2Enabled ? (
						<div className="mt-7 space-y-4">
							<button
								type="button"
								onClick={handleGoogleSignIn}
								className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
							>
								<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
									<path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.5-.2-2.2H12z" />
									<path fill="#34A853" d="M12 22c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.3-4H3.5v2.5A10 10 0 0 0 12 22z" />
									<path fill="#4A90E2" d="M6.7 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.5A10 10 0 0 0 2.4 12c0 1.6.4 3.1 1.1 4.5L6.7 14z" />
									<path fill="#FBBC05" d="M12 6c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0 0 3.5 7.5L6.7 10c.7-2.3 2.8-4 5.3-4z" />
								</svg>
								Login with Google
							</button>
							<p className="text-xs text-slate-400">You will be redirected to your OAuth provider.</p>
						</div>
					) : (
						<div className="mt-7 space-y-5">
							<div>
								<p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Quick Demo Access</p>
								<div className="grid gap-2 sm:grid-cols-3">
									{demoAccounts.map((account) => (
										<button
											key={account.email}
											type="button"
											onClick={() => handleQuickLogin(account)}
											className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
										>
											{account.label}
										</button>
									))}
								</div>
							</div>

							<form onSubmit={handleLocalSignIn} className="grid gap-4">
								<label className="grid gap-1.5 text-sm font-semibold text-slate-700">
									<span>Email</span>
									<input
										type="email"
										placeholder="student1@smartcampus.local"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										required
										className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
									/>
								</label>
								<label className="grid gap-1.5 text-sm font-semibold text-slate-700">
									<span>Role</span>
									<select
										value={role}
										onChange={(event) => setRole(event.target.value)}
										className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
									>
										<option value="USER">USER</option>
										<option value="TECHNICIAN">TECHNICIAN</option>
										<option value="ADMIN">ADMIN</option>
									</select>
								</label>

								<button
									type="submit"
									className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
								>
									Login
								</button>
							</form>
						</div>
					)}

					{feedback && (
						<p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
							{feedback}
						</p>
					)}
					</div>
				</div>
			</div>
		</section>
	);
}

export default LoginPage;
