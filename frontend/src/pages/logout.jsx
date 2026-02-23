/**
 * Logout page.
 * Signs the user out from Firebase and redirects home.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { logout } from '../services/authClient.js'

export default function Logout() {
	const navigate = useNavigate()
	const [error, setError] = useState('')

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				await logout()
				if (!cancelled) window.setTimeout(() => navigate('/'), 650)
			} catch (e) {
				if (!cancelled) setError(e?.message || 'Could not sign out.')
			}
		})()
		return () => {
			cancelled = true
		}
	}, [navigate])

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
						<div className="border-b border-slate-200 px-6 py-5">
							<h1 className="text-xl font-semibold tracking-tight text-slate-900">Signing out</h1>
							<p className="mt-1 text-sm text-slate-600">Please wait…</p>
						</div>
						<div className="px-6 py-6">
							{error ? (
								<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
									{error}
								</div>
							) : (
								<div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
									<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" aria-hidden="true">
										<path
											d="M12 3a9 9 0 019 9"
											stroke="currentColor"
											strokeWidth="1.8"
											strokeLinecap="round"
										/>
									</svg>
									Clearing session…
								</div>
							)}

							<div className="mt-5">
								<Link
									to="/"
									className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
								>
									Go home
								</Link>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}

