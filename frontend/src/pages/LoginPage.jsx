import { useState } from "react";
import { FaApple, FaEye, FaEyeSlash, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
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
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [role, setRole] = useState("USER");
	const [feedback, setFeedback] = useState("");

	if (isLoadingProfile) {
		return <p>Checking authentication status...</p>;
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	function getOAuthProviderUrl(provider) {
		const marker = "/oauth2/authorization/";
		if (loginUrl && loginUrl.includes(marker)) {
			return `${loginUrl.split(marker)[0]}${marker}${provider}`;
		}

		const authBaseUrl = (import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
		return `${authBaseUrl}${marker}${provider}`;
	}

	function handleOAuthSignIn(provider) {
		if (!oauth2Enabled) {
			setFeedback("");
			return;
		}
		const targetUrl = getOAuthProviderUrl(provider);
		if (!targetUrl) {
			setFeedback("Login URL is not configured.");
			return;
		}
		window.location.assign(targetUrl);
	}

	function togglePasswordVisibility() {
		setShowPassword((prev) => !prev);
	}

	async function handleLocalSignIn(event) {
		event.preventDefault();
		setFeedback("");

		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			setFeedback("Email is required.");
			return;
		}

		if (!password.trim()) {
			setFeedback("Password is required.");
			return;
		}

		const roles = role === "ADMIN" ? ["USER", "ADMIN"] : role === "TECHNICIAN" ? ["USER", "TECHNICIAN"] : ["USER"];
		await signInLocal({ email: normalizedEmail, password, roles });
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
							<p className="text-sm font-semibold text-slate-600">Continue with social account</p>
							<div className="grid grid-cols-3 gap-3">
								<button
									type="button"
									onClick={() => handleOAuthSignIn("google")}
									className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_18px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
									aria-label="Login with Google"
									title="Login with Google"
								>
									<FcGoogle className="h-5 w-5" />
									Google
								</button>
								<button
									type="button"
									onClick={() => handleOAuthSignIn("facebook")}
									className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-[#1877F2] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_18px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
									aria-label="Login with Facebook"
									title="Login with Facebook"
								>
									<FaFacebookF className="h-5 w-5" />
									Facebook
								</button>
								<button
									type="button"
									onClick={() => handleOAuthSignIn("apple")}
									className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_18px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
									aria-label="Login with Apple"
									title="Login with Apple"
								>
									<FaApple className="h-5 w-5" />
									Apple
								</button>
							</div>
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
									<span>Password</span>
									<div className="group relative">
										<input
											type={showPassword ? "text" : "password"}
											placeholder="Enter your password"
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											required
											className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-14 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
										/>
										<button
											type="button"
											onClick={togglePasswordVisibility}
											onMouseDown={(event) => event.preventDefault()}
											className="absolute right-1 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 group-focus-within:border-blue-400"
											aria-label={showPassword ? "Password is visible. Hide password" : "Password is hidden. Show password"}
											title={showPassword ? "Hide password" : "Show password"}
											aria-pressed={showPassword}
										>
											{showPassword ? <FaEye className="h-6 w-6" /> : <FaEyeSlash className="h-6 w-6" />}
										</button>
									</div>
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

								<div className="pt-1">
									<p className="mb-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Or login with</p>
									<div className="grid grid-cols-3 gap-3">
										<button
											type="button"
											onClick={() => handleOAuthSignIn("google")}
											className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_18px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
											aria-label="Login with Google"
											title="Login with Google"
										>
											<FcGoogle className="h-5 w-5" />
											Google
										</button>
										<button
											type="button"
											onClick={() => handleOAuthSignIn("facebook")}
											className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-[#1877F2] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_18px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
											aria-label="Login with Facebook"
											title="Login with Facebook"
										>
											<FaFacebookF className="h-5 w-5" />
											Facebook
										</button>
										<button
											type="button"
											onClick={() => handleOAuthSignIn("apple")}
											className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_18px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
											aria-label="Login with Apple"
											title="Login with Apple"
										>
											<FaApple className="h-5 w-5" />
											Apple
										</button>
									</div>
								</div>
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
