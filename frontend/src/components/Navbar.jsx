/**
 * Top navigation bar.
 * Includes search UI and a live-updating cart count via `utils/cart.js`.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar.jsx'
import { getCartCount } from '../utils/cart.js'

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false)
	const [cartCount, setCartCount] = useState(() => getCartCount())

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

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
			<div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
				<a href="#" className="inline-flex items-center gap-2">
					{/* <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
						ES
					</span> */}
					<span className="font-sans pl-5 text-lg font-bold italic tracking-tight text-slate-950 sm:text-xl">
					My Eccomerce store
					</span>
				</a>

				<div className="hidden flex-1 items-center gap-3 md:flex">
					<nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
						{/* <a href="#categories" className="hover:text-slate-890 ml-1 focus-visible:text-slate-950">
							Categories
						</a>
						<a href="#featured" className="hover:text-slate-890 focus-visible:text-slate-950">
							Featured
						</a> */}
						{/* <a href="#" className="hover:text-slate-950">
							Deals
						</a> */}
					</nav>
					<div className="ml-auto w-full min-w-0 max-w-xs pr-5 sm:max-w-sm sm:pl-4 lg:max-w-md">
						<SearchBar placeholder="Search products" />
					</div>
				</div>

				<div className="ml-auto flex items-center gap-2 md:ml-0">
					<div className="hidden items-center gap-1 md:flex">
						<button
							type="button"
							className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
							aria-label="Messages"
						>
							<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
								<path
									d="M7 8h10M7 12h7"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
								/>
								<path
									d="M20 14a4 4 0 01-4 4H9l-5 3V6a4 4 0 014-4h8a4 4 0 014 4v8z"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinejoin="round"
								/>
							</svg>
							<span>Messages</span>
						</button>
						<button
							type="button"
							className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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
						</button>
					</div>

					<button
						type="button"
						className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex md:items-center md:gap-2"
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
					</button>
					<Link
						to="/cart"
						className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
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
						<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-xs">
							{cartCount}
						</span>
					</Link>

					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
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
							<SearchBar placeholder="Search products" />
						</div>
						<nav className="grid gap-2 text-sm font-semibold text-slate-800">
							<button
								type="button"
								className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100"
								onClick={() => setIsOpen(false)}
							>
								<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700" aria-hidden="true">
									<path
										d="M7 8h10M7 12h7"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinecap="round"
									/>
									<path
										d="M20 14a4 4 0 01-4 4H9l-5 3V6a4 4 0 014-4h8a4 4 0 014 4v8z"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinejoin="round"
									/>
								</svg>
								Messages
							</button>
							<button
								type="button"
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
							</button>
							<a href="#categories" className="rounded-lg px-3 py-2 hover:bg-slate-100" onClick={() => setIsOpen(false)}>
								Categories
							</a>
							<a href="#featured" className="rounded-lg px-3 py-2 hover:bg-slate-100" onClick={() => setIsOpen(false)}>
								Featured
							</a>
							<a href="#" className="rounded-lg px-3 py-2 hover:bg-slate-100" onClick={() => setIsOpen(false)}>
								Deals
							</a>
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

