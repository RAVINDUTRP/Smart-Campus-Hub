import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
	addComment,
	assignTechnician,
	createTicket,
	deleteComment,
	fetchAttachments,
	fetchComments,
	fetchTicketById,
	fetchTickets,
	rejectTicket,
	updateComment,
	updateTicketStatus,
	uploadAttachment
} from "../features/tickets/ticketApi";

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

const initialTicketForm = {
	category: "PROJECTOR",
	description: "",
	priority: "MEDIUM",
	resourceId: "",
	location: "",
	requesterEmail: "",
	preferredContact: ""
};

const initialFilters = {
	status: "",
	priority: "",
	requesterEmail: "",
	assignedTechnicianEmail: ""
};

const initialCommentForm = {
	authorEmail: "",
	content: ""
};

const cardShellClass = "overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]";
const cardStripeClass = "h-[3px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500";
const inputClass =
	"h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.14),0_10px_20px_rgba(37,99,235,0.14)]";
const labelClass = "grid gap-1.5 text-sm font-semibold text-slate-700";

const statusTone = {
	OPEN: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
	IN_PROGRESS: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
	RESOLVED: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
	CLOSED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
	REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
};

const priorityTone = {
	LOW: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
	MEDIUM: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
	HIGH: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
	CRITICAL: "bg-red-50 text-red-700 ring-1 ring-red-200"
};

function formatEnumLabel(value) {
	if (!value) {
		return "-";
	}
	return String(value)
		.toLowerCase()
		.split("_")
		.map((token) => token.charAt(0).toUpperCase() + token.slice(1))
		.join(" ");
}

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

function TicketsPage() {
	const { profile, hasAnyRole } = useAuth();
	const canManageTickets = hasAnyRole(["ADMIN", "TECHNICIAN"]);
	const [ticketForm, setTicketForm] = useState(initialTicketForm);
	const [filters, setFilters] = useState(initialFilters);
	const [tickets, setTickets] = useState([]);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [comments, setComments] = useState([]);
	const [attachments, setAttachments] = useState([]);
	const [commentForm, setCommentForm] = useState(initialCommentForm);
	const [assignEmail, setAssignEmail] = useState("");
	const [statusAction, setStatusAction] = useState("IN_PROGRESS");
	const [resolutionNotes, setResolutionNotes] = useState("");
	const [uploadBy, setUploadBy] = useState("");
	const [feedback, setFeedback] = useState({ type: "", text: "" });
	const [isLoadingList, setIsLoadingList] = useState(false);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	const ticketSummary = useMemo(() => {
		return tickets.reduce(
			(accumulator, ticket) => {
				const normalizedStatus = String(ticket?.status || "").toUpperCase();
				if (normalizedStatus === "OPEN") {
					accumulator.open += 1;
				}
				if (normalizedStatus === "IN_PROGRESS") {
					accumulator.inProgress += 1;
				}
				if (normalizedStatus === "RESOLVED") {
					accumulator.resolved += 1;
				}
				if (normalizedStatus === "REJECTED") {
					accumulator.rejected += 1;
				}
				return accumulator;
			},
			{ open: 0, inProgress: 0, resolved: 0, rejected: 0 }
		);
	}, [tickets]);

	useEffect(() => {
		if (!profile?.email) {
			return;
		}
		setTicketForm((prev) => ({
			...prev,
			requesterEmail: profile.email,
			preferredContact: prev.preferredContact || profile.email
		}));
		setCommentForm((prev) => ({ ...prev, authorEmail: profile.email }));
		setAssignEmail((prev) => prev || profile.email);
		setUploadBy((prev) => prev || profile.email);
	}, [profile]);

	function onTicketFormChange(event) {
		const { name, value } = event.target;
		setTicketForm((prev) => ({ ...prev, [name]: value }));
	}

	function onFilterChange(event) {
		const { name, value } = event.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	}

	function onCommentChange(event) {
		const { name, value } = event.target;
		setCommentForm((prev) => ({ ...prev, [name]: value }));
	}

	async function loadTickets(activeFilters = filters) {
		try {
			setIsLoadingList(true);
			const data = await fetchTickets(activeFilters);
			setTickets(data);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsLoadingList(false);
		}
	}

	async function loadTicketDetails(ticketId) {
		try {
			setIsLoadingDetails(true);
			const [ticket, commentData, attachmentData] = await Promise.all([
				fetchTicketById(ticketId),
				fetchComments(ticketId),
				fetchAttachments(ticketId)
			]);
			setSelectedTicket(ticket);
			setComments(commentData);
			setAttachments(attachmentData);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		} finally {
			setIsLoadingDetails(false);
		}
	}

	async function handleCreateTicket(event) {
		event.preventDefault();
		const payload = {
			category: ticketForm.category,
			description: ticketForm.description,
			priority: ticketForm.priority,
			resourceId: ticketForm.resourceId ? Number(ticketForm.resourceId) : null,
			location: ticketForm.location || null,
			requesterEmail: profile?.email || ticketForm.requesterEmail,
			preferredContact: ticketForm.preferredContact || profile?.email || ticketForm.requesterEmail
		};

		try {
			const created = await createTicket(payload);
			setFeedback({ type: "success", text: `Ticket ${created.id} created as OPEN.` });
			await loadTickets();
			await loadTicketDetails(created.id);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleAssignTechnician() {
		if (!selectedTicket || !canManageTickets) {
			return;
		}
		try {
			await assignTechnician(selectedTicket.id, assignEmail);
			setFeedback({ type: "success", text: "Technician assigned successfully." });
			await loadTickets();
			await loadTicketDetails(selectedTicket.id);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleStatusUpdate() {
		if (!selectedTicket || !canManageTickets) {
			return;
		}
		try {
			await updateTicketStatus(selectedTicket.id, statusAction, resolutionNotes);
			setFeedback({ type: "success", text: `Ticket status updated to ${statusAction}.` });
			await loadTickets();
			await loadTicketDetails(selectedTicket.id);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleReject() {
		if (!selectedTicket || !canManageTickets) {
			return;
		}
		const reason = window.prompt("Rejection reason:");
		if (!reason) {
			return;
		}
		try {
			await rejectTicket(selectedTicket.id, reason);
			setFeedback({ type: "success", text: "Ticket rejected." });
			await loadTickets();
			await loadTicketDetails(selectedTicket.id);
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleAddComment(event) {
		event.preventDefault();
		if (!selectedTicket) {
			return;
		}

		try {
			await addComment(selectedTicket.id, {
				...commentForm,
				authorEmail: profile?.email || commentForm.authorEmail
			});
			setCommentForm((prev) => ({ ...prev, content: "" }));
			setFeedback({ type: "success", text: "Comment added." });
			setComments(await fetchComments(selectedTicket.id));
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleEditComment(comment) {
		if (!selectedTicket) {
			return;
		}
		const actorEmail = profile?.email || comment.authorEmail;
		if (!actorEmail) {
			return;
		}
		const content = window.prompt("Updated comment:", comment.content);
		if (!content) {
			return;
		}

		try {
			await updateComment(selectedTicket.id, comment.id, { actorEmail, content });
			setFeedback({ type: "success", text: "Comment updated." });
			setComments(await fetchComments(selectedTicket.id));
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleDeleteComment(comment) {
		if (!selectedTicket) {
			return;
		}
		const actorEmail = profile?.email || comment.authorEmail;
		if (!actorEmail) {
			return;
		}

		try {
			await deleteComment(selectedTicket.id, comment.id, actorEmail);
			setFeedback({ type: "success", text: "Comment deleted." });
			setComments(await fetchComments(selectedTicket.id));
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	async function handleUploadAttachment(event) {
		if (!selectedTicket) {
			return;
		}
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			await uploadAttachment(selectedTicket.id, profile?.email || uploadBy, file);
			setFeedback({ type: "success", text: "Attachment uploaded." });
			setAttachments(await fetchAttachments(selectedTicket.id));
		} catch (error) {
			setFeedback({ type: "error", text: getErrorMessage(error) });
		}
	}

	return (
		<section className="grid gap-4">
			<header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-7 shadow-2xl">
				<div className="pointer-events-none absolute -left-20 -top-14 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
				<div className="relative flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-blue-100">
							<span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.95)]" />
							Issue Desk
						</p>
						<h2 className="m-0 text-[2rem] font-black tracking-tight text-white">Maintenance and Incidents</h2>
						<p className="m-0 mt-2 max-w-2xl text-sm text-slate-300">
							Report issues, assign technicians, manage lifecycle, and track evidence with comments.
						</p>
					</div>
					<div className="grid min-w-[240px] grid-cols-2 gap-2">
						<div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-3 py-2">
							<p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-emerald-200">Open</p>
							<p className="m-0 mt-1 text-xl font-black text-emerald-100">{ticketSummary.open}</p>
						</div>
						<div className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-3 py-2">
							<p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-amber-100">In Progress</p>
							<p className="m-0 mt-1 text-xl font-black text-amber-100">{ticketSummary.inProgress}</p>
						</div>
						<div className="rounded-2xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-2">
							<p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-cyan-100">Resolved</p>
							<p className="m-0 mt-1 text-xl font-black text-cyan-100">{ticketSummary.resolved}</p>
						</div>
						<div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 px-3 py-2">
							<p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-rose-100">Rejected</p>
							<p className="m-0 mt-1 text-xl font-black text-rose-100">{ticketSummary.rejected}</p>
						</div>
					</div>
				</div>
			</header>

			<div className="grid gap-4 lg:grid-cols-2">
				<article className={cardShellClass}>
					<div className={cardStripeClass} />
					<div className="grid gap-4 p-6">
						<div>
							<h3 className="m-0 text-xl font-black tracking-tight text-slate-900">Create Incident Ticket</h3>
							<p className="m-0 mt-1 text-sm text-slate-500">Capture incident details and submit as an OPEN ticket.</p>
						</div>
						<form className="grid gap-3" onSubmit={handleCreateTicket}>
							<label className={labelClass}>
								<span>Category</span>
								<input
									name="category"
									value={ticketForm.category}
									onChange={onTicketFormChange}
									required
									className={inputClass}
								/>
							</label>

							<label className={labelClass}>
								<span>Description</span>
								<input
									name="description"
									value={ticketForm.description}
									onChange={onTicketFormChange}
									required
									className={inputClass}
									placeholder="Briefly explain the issue"
								/>
							</label>

							<div className="grid gap-3 sm:grid-cols-2">
								<label className={labelClass}>
									<span>Priority</span>
									<select name="priority" value={ticketForm.priority} onChange={onTicketFormChange} className={inputClass}>
										{priorities.map((priority) => (
											<option key={priority} value={priority}>
												{formatEnumLabel(priority)}
											</option>
										))}
									</select>
								</label>

								<label className={labelClass}>
									<span>Resource ID (Optional)</span>
									<input
										name="resourceId"
										value={ticketForm.resourceId}
										onChange={onTicketFormChange}
										type="number"
										min="1"
										className={inputClass}
									/>
								</label>
							</div>

							<label className={labelClass}>
								<span>Location (Optional)</span>
								<input
									name="location"
									value={ticketForm.location}
									onChange={onTicketFormChange}
									className={inputClass}
									placeholder="Building, room, or area"
								/>
							</label>

							<label className={labelClass}>
								<span>Requester Email</span>
								<input
									name="requesterEmail"
									value={profile?.email || ticketForm.requesterEmail}
									type="email"
									readOnly
									required
									className={inputClass}
								/>
							</label>

							<label className={labelClass}>
								<span>Preferred Contact</span>
								<input
									name="preferredContact"
									value={ticketForm.preferredContact}
									onChange={onTicketFormChange}
									required
									className={inputClass}
								/>
							</label>

							<div className="mt-1 flex flex-wrap gap-2">
								<button
									type="submit"
									className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-[0_10px_18px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(37,99,235,0.34)]"
								>
									Create Ticket
								</button>
								<button
									type="button"
									onClick={() => loadTickets()}
									className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-white"
								>
									Refresh List
								</button>
							</div>
						</form>
					</div>
				</article>

				<article className={cardShellClass}>
					<div className={cardStripeClass} />
					<div className="grid gap-4 p-6">
						<div>
							<h3 className="m-0 text-xl font-black tracking-tight text-slate-900">Ticket Filters</h3>
							<p className="m-0 mt-1 text-sm text-slate-500">Filter by status, priority, requester, or technician email.</p>
						</div>
						<form
							className="grid gap-3"
							onSubmit={(event) => {
								event.preventDefault();
								loadTickets(filters);
							}}
						>
							<label className={labelClass}>
								<span>Status</span>
								<select name="status" value={filters.status} onChange={onFilterChange} className={inputClass}>
									<option value="">All</option>
									{statuses.map((status) => (
										<option key={status} value={status}>
											{formatEnumLabel(status)}
										</option>
									))}
								</select>
							</label>

							<label className={labelClass}>
								<span>Priority</span>
								<select name="priority" value={filters.priority} onChange={onFilterChange} className={inputClass}>
									<option value="">All</option>
									{priorities.map((priority) => (
										<option key={priority} value={priority}>
											{formatEnumLabel(priority)}
										</option>
									))}
								</select>
							</label>

							<label className={labelClass}>
								<span>Requester Email</span>
								<input name="requesterEmail" value={filters.requesterEmail} onChange={onFilterChange} type="email" className={inputClass} />
							</label>

							<label className={labelClass}>
								<span>Technician Email</span>
								<input
									name="assignedTechnicianEmail"
									value={filters.assignedTechnicianEmail}
									onChange={onFilterChange}
									type="email"
									className={inputClass}
								/>
							</label>

							<div className="mt-1 flex flex-wrap gap-2">
								<button
									type="submit"
									className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 text-sm font-bold text-white shadow-[0_10px_18px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5"
								>
									Apply Filters
								</button>
								<button
									type="button"
									onClick={() => {
										setFilters(initialFilters);
										loadTickets(initialFilters);
									}}
									className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-white"
								>
									Reset
								</button>
							</div>
						</form>
					</div>
				</article>
			</div>

			{feedback.text && (
				<p
					className={`m-0 rounded-2xl border px-4 py-3 text-sm font-semibold ${
						feedback.type === "error"
							? "border-rose-200 bg-rose-50 text-rose-700"
							: "border-emerald-200 bg-emerald-50 text-emerald-700"
					}`}
				>
					{feedback.text}
				</p>
			)}

			<article className={cardShellClass}>
				<div className={cardStripeClass} />
				<div className="p-6">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<div>
							<h3 className="m-0 text-xl font-black tracking-tight text-slate-900">Tickets</h3>
							<p className="m-0 mt-1 text-sm text-slate-500">Select a ticket to open full details and actions.</p>
						</div>
						<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.11em] text-slate-600">
							{tickets.length} item(s)
						</span>
					</div>

					{isLoadingList ? (
						<p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">Loading tickets...</p>
					) : tickets.length === 0 ? (
						<p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
							No tickets loaded yet. Use refresh or create one.
						</p>
					) : (
						<div className="overflow-x-auto rounded-2xl border border-slate-200/80">
							<table className="min-w-full border-collapse bg-white text-sm">
								<thead>
									<tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.11em] text-slate-500">
										<th className="px-3 py-3">ID</th>
										<th className="px-3 py-3">Category</th>
										<th className="px-3 py-3">Priority</th>
										<th className="px-3 py-3">Status</th>
										<th className="px-3 py-3">Requester</th>
										<th className="px-3 py-3">Action</th>
									</tr>
								</thead>
								<tbody>
									{tickets.map((ticket) => (
										<tr key={ticket.id} className="border-t border-slate-100">
											<td className="px-3 py-3 font-semibold text-slate-700">#{ticket.id}</td>
											<td className="px-3 py-3 text-slate-700">{formatEnumLabel(ticket.category)}</td>
											<td className="px-3 py-3">
												<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] ${priorityTone[ticket.priority] || priorityTone.MEDIUM}`}>
													{formatEnumLabel(ticket.priority)}
												</span>
											</td>
											<td className="px-3 py-3">
												<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] ${statusTone[ticket.status] || statusTone.OPEN}`}>
													{formatEnumLabel(ticket.status)}
												</span>
											</td>
											<td className="px-3 py-3 text-slate-700">{ticket.requesterEmail}</td>
											<td className="px-3 py-3">
												<button
													type="button"
													onClick={() => loadTicketDetails(ticket.id)}
													className="h-9 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:-translate-y-0.5"
												>
													Open
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</article>

			{selectedTicket && (
				<article className={cardShellClass}>
					<div className={cardStripeClass} />
					<div className="grid gap-4 p-6">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h3 className="m-0 text-xl font-black tracking-tight text-slate-900">Ticket #{selectedTicket.id} Details</h3>
								<p className="m-0 mt-1 text-sm text-slate-500">Review lifecycle actions, attachments, and discussion.</p>
							</div>
							<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] ${statusTone[selectedTicket.status] || statusTone.OPEN}`}>
								{formatEnumLabel(selectedTicket.status)}
							</span>
						</div>

						{isLoadingDetails ? (
							<p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">Loading details...</p>
						) : (
							<>
								<div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
									<p className="m-0 text-sm text-slate-700">
										<strong className="font-black text-slate-900">{formatEnumLabel(selectedTicket.category)}</strong>: {selectedTicket.description}
									</p>
									<p className="m-0 mt-2 text-sm text-slate-600">
										Location: {selectedTicket.location || "-"} | Resource: {selectedTicket.resourceName || "-"}
									</p>
								</div>

								<div className="grid gap-4 lg:grid-cols-2">
									{canManageTickets && (
										<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
											<h4 className="m-0 text-base font-black text-slate-900">Technician and Status Actions</h4>
											<div className="mt-3 grid gap-3">
												<label className={labelClass}>
													<span>Technician Email</span>
													<input value={assignEmail} onChange={(event) => setAssignEmail(event.target.value)} type="email" className={inputClass} />
												</label>
												<div className="flex flex-wrap gap-2">
													<button
														type="button"
														onClick={handleAssignTechnician}
														className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white"
													>
														Assign
													</button>
													<button
														type="button"
														onClick={handleReject}
														className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"
													>
														Reject
													</button>
												</div>

												<label className={labelClass}>
													<span>Next Status</span>
													<select value={statusAction} onChange={(event) => setStatusAction(event.target.value)} className={inputClass}>
														{statuses.map((status) => (
															<option key={status} value={status}>
																{formatEnumLabel(status)}
															</option>
														))}
													</select>
												</label>

												<label className={labelClass}>
													<span>Resolution Notes</span>
													<input value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} className={inputClass} />
												</label>

												<button
													type="button"
													onClick={handleStatusUpdate}
													className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white"
												>
													Update Status
												</button>
											</div>
										</div>
									)}

									<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
										<h4 className="m-0 text-base font-black text-slate-900">Attachments (max 3 images)</h4>
										<div className="mt-3 grid gap-3">
											<label className={labelClass}>
												<span>Upload By</span>
												<input value={profile?.email || uploadBy} type="email" readOnly className={inputClass} />
											</label>

											<input
												type="file"
												accept="image/*"
												onChange={handleUploadAttachment}
												className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-200"
											/>

											{attachments.length === 0 ? (
												<p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">No attachments yet.</p>
											) : (
												<ul className="m-0 grid list-none gap-2 p-0">
													{attachments.map((attachment) => (
														<li key={attachment.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
															{attachment.fileName} ({Math.round((attachment.fileSize || 0) / 1024)} KB)
														</li>
													))}
												</ul>
											)}
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
									<h4 className="m-0 text-base font-black text-slate-900">Comments</h4>
									<form className="mt-3 grid gap-3" onSubmit={handleAddComment}>
										<label className={labelClass}>
											<span>Author Email</span>
											<input name="authorEmail" value={profile?.email || commentForm.authorEmail} type="email" readOnly className={inputClass} />
										</label>
										<label className={labelClass}>
											<span>Comment</span>
											<input name="content" value={commentForm.content} onChange={onCommentChange} required className={inputClass} />
										</label>
										<button
											type="submit"
											className="h-10 w-fit rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white"
										>
											Add Comment
										</button>
									</form>

									{comments.length === 0 ? (
										<p className="m-0 mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">No comments yet.</p>
									) : (
										<ul className="m-0 mt-3 grid list-none gap-2 p-0">
											{comments.map((comment) => (
												<li key={comment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
													<p className="m-0 text-sm text-slate-700">
														<strong className="font-black text-slate-900">{comment.authorEmail}</strong>: {comment.content}
													</p>
													<div className="mt-2 flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() => handleEditComment(comment)}
															className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-[0.07em] text-slate-700"
														>
															Edit
														</button>
														<button
															type="button"
															onClick={() => handleDeleteComment(comment)}
															className="h-8 rounded-lg bg-rose-600 px-3 text-xs font-bold uppercase tracking-[0.07em] text-white"
														>
															Delete
														</button>
													</div>
												</li>
											))}
										</ul>
									)}
								</div>
							</>
						)}
					</div>
				</article>
			)}
		</section>
	);
}

export default TicketsPage;
