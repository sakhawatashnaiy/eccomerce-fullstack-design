/**
 * Top navigation bar.
 * Includes search UI and a live-updating cart count via `utils/cart.js`.
 */
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar.jsx'
import { getCartCount } from '../utils/cart.js'
import { getAuthUser, isSignedIn, subscribeAuthUpdated } from '../utils/authSession.js'

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
	if (!set) return true
	const user = getAuthUser()
	const email = normalizeEmail(user?.email)
	return Boolean(email && set.has(email))
}

export default function Navbar() {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)
	const [cartCount, setCartCount] = useState(() => getCartCount())
	const [searchText, setSearchText] = useState('')
	const [signedIn, setSignedIn] = useState(() => isSignedIn())
	const [canSeeAdmin, setCanSeeAdmin] = useState(() => (isSignedIn() ? isAdminAllowed() : false))

	const submitSearch = useCallback(
		(text) => {
			const query = String(text || '').trim()
			if (!query) {
				navigate('/products')
			} else {
				navigate(`/products?search=${encodeURIComponent(query)}`)
			}
			setIsOpen(false)
		},
		[navigate]
	)

	useEffect(() => {
		const refresh = () => setCartCount(getCartCount())
		refresh()

		window.addEventListener('cart:updated', refresh)
		window.addEventListener('storage', refresh)
		return () => {
			window.removeEventListener('cart:updated', refresh)
			window.removeEventListener('storage', refresh)
		}
	}, [])

	useEffect(() => {
		const refresh = () => {
			const nextSignedIn = isSignedIn()
			setSignedIn(nextSignedIn)
			setCanSeeAdmin(nextSignedIn ? isAdminAllowed() : false)
		}
		refresh()
		return subscribeAuthUpdated(refresh)
	}, [])

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
			<div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
				<Link to="/" className="inline-flex items-center gap-2">
					{/* <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
						ES
					</span> */}
					<span className="navbar-brand-animated font-sans text-lg font-bold italic tracking-tight text-slate-950 transition-transform duration-300 hover:-translate-y-0.5 sm:text-xl">
						My Eccomerce store
					</span>
				</Link>

				<div className="hidden flex-1 items-center gap-3 md:flex">
					<nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
						<Link to="/about" className="rounded-lg px-2 py-1 transition-colors hover:text-slate-900 whitespace-nowrap">
							About
						</Link>
						<Link to="/giftcards" className="rounded-lg px-2 py-1 transition-colors hover:text-slate-900 whitespace-nowrap">
							Gift cards
						</Link>
					</nav>
					<div className="ml-auto w-full min-w-0 max-w-xs pr-5 sm:max-w-sm sm:pl-4 lg:max-w-md">
						<SearchBar
							placeholder="Search products"
							value={searchText}
							onChange={setSearchText}
							onSubmit={submitSearch}
						/>
					</div>
				</div>

				<div className="ml-auto flex items-center gap-2 md:ml-0">
					<div className="hidden items-center gap-1 md:flex">
						{signedIn && canSeeAdmin ? (
							<Link
								to="/admin/dashboard"
								className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
								aria-label="Admin"
							>
								<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
									<path
										d="M10 3h4v3h-4V3z"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinejoin="round"
									/>
									<path
										d="M6 6h12v15H6V6z"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinejoin="round"
									/>
									<path
										d="M9 10h6M9 13.5h6M9 17h4"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinecap="round"
									/>
								</svg>
								<span>Admin</span>
							</Link>
						) : null}
						<Link
							to="/orders"
							className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
							aria-label="Orders"
						>
							<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
								<path
									d="M7 7h10v14H7V7z"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinejoin="round"
								/>
								<path
									d="M9 3h6v4H9V3z"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinejoin="round"
								/>
								<path
									d="M9.5 11h5M9.5 14.5h5"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
							</svg>
							<span>Orders</span>
						</Link>
					</div>

					{signedIn ? (
						<Link
							to="/logout"
							className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100 md:inline-flex md:items-center md:gap-2"
							aria-label="Sign out"
						>
							<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
								<path
									d="M10 7H7a2 2 0 00-2 2v8a2 2 0 002 2h3"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
								<path
									d="M14 17l5-5-5-5"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M19 12H9"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
							</svg>
							<span>Sign out</span>
						</Link>
					) : (
						<Link
							to="/login"
							className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100 md:inline-flex md:items-center md:gap-2"
							aria-label="Sign in"
						>
							<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
								<path
									d="M20 21a8 8 0 10-16 0"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
								<path
									d="M12 11a4 4 0 100-8 4 4 0 000 8z"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinejoin="round"
								/>
							</svg>
							<span>Sign in</span>
						</Link>
					)}
					<Link
						to="/cart"
						className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-900"
						aria-label="Open cart"
					>
						<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
							<path
								d="M6 7h15l-1.5 8.5a2 2 0 01-2 1.5H9a2 2 0 01-2-1.6L5 4H2"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"
								fill="currentColor"
							/>
						</svg>
						<span className="hidden sm:inline">Cart</span>
						<span
							key={cartCount}
							className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-xs animate-cart-pop"
						>
							{cartCount}
						</span>
					</Link>

					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition-colors duration-200 hover:bg-slate-100 md:hidden"
						aria-label={isOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={isOpen}
						onClick={() => setIsOpen((v) => !v)}
					>
						<svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
							{isOpen ? (
								<path
									d="M6 6l12 12M18 6L6 18"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
							) : (
								<path
									d="M4 7h16M4 12h16M4 17h16"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
							)}
						</svg>
					</button>
				</div>
			</div>

			{isOpen ? (
				<div className="border-t border-slate-200 bg-white md:hidden">
					<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
						<div className="mb-4">
							<SearchBar
								placeholder="Search products"
								value={searchText}
								onChange={setSearchText}
								onSubmit={submitSearch}
							/>
						</div>
						<nav className="grid gap-2 text-sm font-semibold text-slate-800">
							{signedIn && canSeeAdmin ? (
								<Link
									to="/admin/dashboard"
									className="rounded-lg px-3 py-2 hover:bg-slate-100"
									onClick={() => setIsOpen(false)}
								>
									Admin
								</Link>
							) : null}
							<Link
								to="/about"
								className="rounded-lg px-3 py-2 hover:bg-slate-100 whitespace-nowrap"
								onClick={() => setIsOpen(false)}
							>
								About
							</Link>
							<Link
								to="/giftcards"
								className="rounded-lg px-3 py-2 hover:bg-slate-100 whitespace-nowrap"
								onClick={() => setIsOpen(false)}
							>
								Gift cards
							</Link>
							<Link
								to="/orders"
								className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100"
								onClick={() => setIsOpen(false)}
							>
								<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700" aria-hidden="true">
									<path
										d="M7 7h10v14H7V7z"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinejoin="round"
									/>
									<path
										d="M9 3h6v4H9V3z"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinejoin="round"
									/>
									<path
										d="M9.5 11h5M9.5 14.5h5"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinecap="round"
									/>
								</svg>
								Orders
							</Link>
							<button
								type="button"
								className="mt-2 rounded-lg bg-slate-950 px-3 py-2 text-left text-sm font-semibold text-white"
							>
								Sign in
							</button>
						</nav>
					</div>
				</div>
			) : null}
		</header>
	)
}

