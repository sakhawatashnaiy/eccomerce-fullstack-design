/**
 * ProtectedRoute
 * - If not signed in, redirects to /login
 * - If `requireAdmin` is true and VITE_ADMIN_EMAILS is set, only allows those emails
 */

import { Navigate, useLocation } from 'react-router-dom'
import { getAuthUser, isSignedIn } from '../utils/authSession.js'

function normalizeEmail(value) {
	return String(value || '').trim().toLowerCase()
}

function getAdminEmailSet() {
	const raw = String(import.meta.env.VITE_ADMIN_EMAILS || '').trim()
	if (!raw) return null

	const emails = raw
		.split(',')
		.map((e) => normalizeEmail(e))
		.filter(Boolean)

	return new Set(emails)
}

function isAdminAllowed() {
	const set = getAdminEmailSet()
	if (!set) return true // no env configured => only require sign-in

	const user = getAuthUser()
	const email = normalizeEmail(user?.email)
	return Boolean(email && set.has(email))
}

export default function ProtectedRoute({ children, requireAdmin = false }) {
	const location = useLocation()

	if (!isSignedIn()) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />
	}

	if (requireAdmin && !isAdminAllowed()) {
		return (
			<div className="min-h-screen bg-slate-50 text-slate-900">
				<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
						<div className="border-b border-slate-200 px-6 py-5">
							<p className="text-xs font-semibold text-slate-600">403</p>
							<h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
								Admin access required
							</h1>
							<p className="mt-2 text-sm text-slate-600">
								This page is restricted. If you’re an admin, add your email to
								<code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">VITE_ADMIN_EMAILS</code>
								and restart the dev server.
							</p>
						</div>
						<div className="px-6 py-6">
							<a
								href="/"
								className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
							>
								Go home
							</a>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return children
}
