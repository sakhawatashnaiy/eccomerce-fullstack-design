/**
 * Admin layout with glassmorphism topbar, collapsible sidebar, and global search.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Command, LayoutDashboard, Menu, Moon, Package, Search, Sun, Truck, X } from 'lucide-react'

const NAV_ITEMS = [
	{ to: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
	{ to: '/admin/orders', label: 'Orders', icon: Truck },
	{ to: '/admin/products', label: 'Inventory', icon: Package },
]

function cx(...classes) {
	return classes.filter(Boolean).join(' ')
}

function useTheme() {
	const [theme, setTheme] = useState(() => localStorage.getItem('admin:theme') || 'light')

	useEffect(() => {
		const root = document.documentElement
		if (theme === 'dark') root.classList.add('theme-dark')
		else root.classList.remove('theme-dark')
		localStorage.setItem('admin:theme', theme)
	}, [theme])

	return { theme, setTheme }
}

function GlobalSearch({ open, onClose }) {
	const inputRef = useRef(null)

	useEffect(() => {
		if (!open) return
		const id = window.setTimeout(() => inputRef.current?.focus(), 50)
		return () => window.clearTimeout(id)
	}, [open])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
			<div className="surface-card w-full max-w-2xl overflow-hidden">
				<div className="flex items-center gap-3 border-b border-[color:var(--ring)] px-5 py-4">
					<Search className="h-4 w-4 text-muted" aria-hidden="true" />
					<input
						ref={inputRef}
						type="text"
						placeholder="Search orders, customers, SKU, tracking, or insights..."
						className="h-10 flex-1 bg-transparent text-sm text-[color:var(--text)] outline-none"
					/>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg px-3 py-1 text-xs font-semibold text-muted hover:bg-[color:var(--surface-strong)]"
					>
						ESC
					</button>
				</div>
				<div className="px-5 py-4">
					<p className="text-xs font-semibold uppercase tracking-widest text-muted">Suggested</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2">
						{['Late shipments', 'Low stock alerts', 'High LTV cohort', 'Refund queue'].map((item) => (
							<button
								key={item}
								type="button"
								className="rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] px-3 py-3 text-left text-sm text-[color:var(--text)] hover:bg-[color:var(--surface)]"
							>
								{item}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default function AdminLayout({ children, breadcrumbs = [] }) {
	const location = useLocation()
	const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin:sidebar') === 'collapsed')
	const [searchOpen, setSearchOpen] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)
	const { theme, setTheme } = useTheme()

	useEffect(() => {
		localStorage.setItem('admin:sidebar', collapsed ? 'collapsed' : 'expanded')
	}, [collapsed])

	useEffect(() => {
		const handleKey = (event) => {
			const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
			if (isCmdK) {
				event.preventDefault()
				setSearchOpen(true)
			}
			if (event.key === 'Escape') setSearchOpen(false)
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])

	useEffect(() => {
		setMobileOpen(false)
	}, [location.pathname])

	const breadcrumbTrail = useMemo(() => {
		if (breadcrumbs.length) return breadcrumbs
		const segments = location.pathname.split('/').filter(Boolean).slice(1)
		return segments.map((segment, index) => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1),
			to: `/admin/${segments.slice(0, index + 1).join('/')}`,
		}))
	}, [breadcrumbs, location.pathname])

	return (
		<div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
			<GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
			<div className="flex min-h-screen">
				{mobileOpen ? (
					<button
						type="button"
						aria-label="Close navigation"
						onClick={() => setMobileOpen(false)}
						className="fixed inset-0 z-30 bg-black/40 md:hidden"
					/>
				) : null}
				<aside
					className={cx(
						'fixed inset-y-0 left-0 z-40 flex h-full flex-col gap-6 overflow-y-auto border-r border-[color:var(--ring)] bg-[color:var(--bg-elevated)] px-4 py-6 transition-transform duration-300 md:static md:translate-x-0',
						mobileOpen ? 'translate-x-0' : '-translate-x-full',
						collapsed ? 'md:w-20' : 'md:w-64',
						'w-64'
					)}
				>
					<div className="flex items-center justify-between">
						<Link to="/" className="flex items-center gap-2 text-sm font-semibold">
							<span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--primary)] text-white">
								EC
							</span>
							{collapsed ? null : <span>Enterprise Command</span>}
						</Link>
						<button
							type="button"
							onClick={() => setCollapsed((v) => !v)}
							className="hidden rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-2 py-2 text-xs font-semibold text-muted hover:bg-[color:var(--surface-strong)] md:inline-flex"
						>
							{collapsed ? '>>' : '<<'}
						</button>
						<button
							type="button"
							onClick={() => setMobileOpen(false)}
							className="inline-flex rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-2 py-2 text-xs font-semibold text-muted hover:bg-[color:var(--surface-strong)] md:hidden"
						>
							<X className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>

					<nav className="flex flex-1 flex-col gap-1">
						{NAV_ITEMS.map((item) => {
							const Icon = item.icon
							return (
								<NavLink
									key={item.to}
									to={item.to}
									onClick={() => setMobileOpen(false)}
									className={({ isActive }) =>
										cx(
											'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition',
											isActive
												? 'bg-[color:var(--primary-soft)] text-[color:var(--primary)]'
												: 'text-muted hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'
										)
									}
								>
									<Icon className="h-5 w-5" aria-hidden="true" />
									{collapsed ? null : <span>{item.label}</span>}
								</NavLink>
							)
						})}
					</nav>

					<div className="rounded-2xl bg-[color:var(--surface-strong)] p-4 text-xs text-muted">
						<p className="font-semibold text-[color:var(--text)]">Global ops</p>
						<p className="mt-2">APAC, EMEA, Americas fully synced.</p>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="glass-panel sticky top-0 z-30 mx-4 mt-4 rounded-[var(--radius)] px-4 py-4 sm:mx-6 sm:mt-6 sm:px-6">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-widest text-muted">Admin Dashboard</p>
								<nav className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
									{breadcrumbTrail.map((crumb, index) => (
										<span key={crumb.to} className="flex items-center gap-2">
											<Link className="hover:text-[color:var(--text)]" to={crumb.to}>
												{crumb.label}
											</Link>
											{index < breadcrumbTrail.length - 1 ? <span>/</span> : null}
										</span>
									))}
								</nav>
							</div>
							<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
								<button
									type="button"
									onClick={() => setMobileOpen(true)}
									className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-sm text-muted hover:bg-[color:var(--surface-strong)] md:hidden sm:w-auto"
								>
									<Menu className="h-4 w-4" aria-hidden="true" />
									<span>Menu</span>
								</button>
								<button
									type="button"
									onClick={() => setSearchOpen(true)}
									className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-sm text-muted hover:bg-[color:var(--surface-strong)] sm:w-auto sm:justify-start"
									aria-label="Open search"
								>
									<Search className="h-4 w-4" aria-hidden="true" />
									<span className="sm:hidden">Search</span>
									<span className="hidden sm:inline">Search...</span>
									<span className="ml-2 hidden items-center gap-1 rounded-full border border-[color:var(--ring)] px-2 py-0.5 text-[10px] sm:inline-flex">
										<Command className="h-3 w-3" aria-hidden="true" />K
									</span>
								</button>
								<button
									type="button"
									onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
									className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-sm text-muted hover:bg-[color:var(--surface-strong)] sm:w-auto sm:justify-start"
									aria-label="Toggle theme"
								>
									{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
									<span className="sm:hidden">Theme</span>
									<span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
								</button>
							</div>
						</div>
					</header>

					<main className="flex-1 px-4 pb-10 pt-6 sm:px-6">{children}</main>
				</div>
			</div>
		</div>
	)
}
