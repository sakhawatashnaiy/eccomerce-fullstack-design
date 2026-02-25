/**
 * Admin layout with glassmorphism topbar, collapsible sidebar, and global search.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
	BarChart3,
	Boxes,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Command,
	CreditCard,
	LayoutDashboard,
	List,
	LogOut,
	Menu,
	Moon,
	Package,
	PackagePlus,
	Search,
	Sun,
	Settings,
	Star,
	Tag,
	TicketPercent,
	Truck,
	Users,
	X,
	XCircle,
	Clock,
	RefreshCcw,
	CheckCircle2,
} from 'lucide-react'

import { getAuthUser, subscribeAuthUpdated } from '../../utils/authSession.js'

const SIDEBAR_MENU = [
	{ type: 'link', label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
	{
		type: 'group',
		label: 'Products',
		icon: Package,
		match: '/admin/products',
		items: [
			{ label: 'All Products', to: '/admin/products', icon: List },
			{ label: 'Add Product', to: '/admin/products?mode=add', icon: PackagePlus },
			{ label: 'Categories', to: '/admin/products?view=categories', icon: Tag },
			{ label: 'Inventory', to: '/admin/products?view=inventory', icon: Boxes },
		],
	},
	{
		type: 'group',
		label: 'Orders',
		icon: Truck,
		match: '/admin/orders',
		items: [
			{ label: 'All Orders', to: '/admin/orders', icon: List },
			{ label: 'Pending', to: '/admin/orders?status=pending', icon: Clock },
			{ label: 'Processing', to: '/admin/orders?status=processing', icon: RefreshCcw },
			{ label: 'Completed', to: '/admin/orders?status=completed', icon: CheckCircle2 },
			{ label: 'Cancelled', to: '/admin/orders?status=cancelled', icon: XCircle },
		],
	},
	{ type: 'link', label: 'Customers / Users', to: '/admin/dashboard?panel=customers', icon: Users },
	{ type: 'link', label: 'Payments', to: '/admin/dashboard?panel=payments', icon: CreditCard },
	{ type: 'link', label: 'Coupons / Discounts', to: '/admin/dashboard?panel=coupons', icon: TicketPercent },
	{ type: 'link', label: 'Reviews', to: '/admin/dashboard?panel=reviews', icon: Star },
	{ type: 'link', label: 'Reports / Analytics', to: '/admin/dashboard?panel=reports', icon: BarChart3 },
	{ type: 'link', label: 'Settings', to: '/admin/dashboard?panel=settings', icon: Settings },
]

function cx(...classes) {
	return classes.filter(Boolean).join(' ')
}

function isPathActive(pathname, matchPrefix) {
	if (!matchPrefix) return false
	return String(pathname || '').startsWith(String(matchPrefix))
}

function SidebarLink({ to, label, icon: Icon, collapsed, onNavigate, kind = 'primary' }) {
	return (
		<NavLink
			to={to}
			onClick={onNavigate}
			className={({ isActive }) =>
				cx(
					'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors',
					kind === 'danger' ? 'text-rose-600 hover:bg-rose-500/10' : '',
					isActive
						? kind === 'danger'
							? 'bg-rose-500/10'
							: 'bg-[color:var(--primary-soft)] text-[color:var(--primary)]'
						: kind === 'danger'
							? ''
							: 'text-muted hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'
				)
			}
		>
			<Icon
				className={cx('h-5 w-5', kind === 'danger' ? 'text-rose-600' : 'text-[color:currentColor]')}
				aria-hidden="true"
			/>
			{collapsed ? null : <span className="truncate">{label}</span>}
		</NavLink>
	)
}

function SidebarGroup({ label, icon: Icon, items, collapsed, isOpen, isActive, onToggle, onNavigate }) {
	return (
		<div className="space-y-1">
			<button
				type="button"
				onClick={onToggle}
				className={cx(
					'group flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition-colors',
					isActive
						? 'bg-[color:var(--primary-soft)] text-[color:var(--primary)]'
						: 'text-muted hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'
				)}
				aria-expanded={Boolean(isOpen)}
			>
				<span className="flex min-w-0 items-center gap-3">
					<Icon className="h-5 w-5" aria-hidden="true" />
					{collapsed ? null : <span className="truncate">{label}</span>}
				</span>
				{collapsed ? null : (
					<ChevronDown
						className={cx('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
						aria-hidden="true"
					/>
				)}
			</button>

			{collapsed || !isOpen ? null : (
				<div className="ml-2 space-y-1 border-l border-[color:var(--ring)] pl-3">
					{items.map((item) => (
						<SidebarLink
							key={item.to}
							to={item.to}
							label={item.label}
							icon={item.icon}
							collapsed={false}
							onNavigate={onNavigate}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function pickInitial(value) {
	const str = String(value || '').trim()
	if (!str) return 'A'
	return str.charAt(0).toUpperCase()
}

function useTheme() {
	const [theme, setTheme] = useState(() => localStorage.getItem('admin:theme') || 'light')

	useLayoutEffect(() => {
		const root = document.documentElement
		const isDark = theme === 'dark'
		root.classList.toggle('theme-dark', isDark)
		root.dataset.theme = theme
		// If any styles ever rely on body, keep it in sync too.
		document.body?.classList.toggle('theme-dark', isDark)
		try {
			localStorage.setItem('admin:theme', theme)
		} catch {
			// ignore
		}
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
	const [authUser, setAuthUser] = useState(() => getAuthUser())
	const [openGroups, setOpenGroups] = useState(() => ({ products: true, orders: true }))

	useEffect(() => {
		return subscribeAuthUpdated(() => setAuthUser(getAuthUser()))
	}, [])

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

	useEffect(() => {
		// Keep the group containing the active route open.
		setOpenGroups((prev) => ({
			...prev,
			products: prev.products || isPathActive(location.pathname, '/admin/products'),
			orders: prev.orders || isPathActive(location.pathname, '/admin/orders'),
		}))
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
							{collapsed ? null : (
								<span className="leading-tight">
									<span className="block">Enterprise Command</span>
									<span className="mt-0.5 block text-xs font-semibold text-muted">Admin console</span>
								</span>
							)}
						</Link>
						<button
							type="button"
							onClick={() => setCollapsed((v) => !v)}
							aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
							className="hidden items-center justify-center rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-2 py-2 text-xs font-semibold text-muted hover:bg-[color:var(--surface-strong)] md:inline-flex"
						>
							{collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
						</button>
						<button
							type="button"
							onClick={() => setMobileOpen(false)}
							className="inline-flex rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-2 py-2 text-xs font-semibold text-muted hover:bg-[color:var(--surface-strong)] md:hidden"
						>
							<X className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>

					<div className={cx('flex items-center justify-between px-1', collapsed ? '' : '')}>
						{collapsed ? null : <p className="text-xs font-semibold uppercase tracking-widest text-muted">Menu</p>}
					</div>

					<nav className="flex flex-1 flex-col gap-1">
						{SIDEBAR_MENU.map((entry) => {
							if (entry.type === 'link') {
								return (
									<SidebarLink
										key={entry.to}
										to={entry.to}
										label={entry.label}
										icon={entry.icon}
										collapsed={collapsed}
										onNavigate={() => setMobileOpen(false)}
									/>
								)
							}

							const groupKey = entry.label.toLowerCase()
							const active = isPathActive(location.pathname, entry.match)
							const open = Boolean(openGroups[groupKey])

							return (
								<SidebarGroup
									key={entry.label}
									label={entry.label}
									icon={entry.icon}
									items={entry.items}
									collapsed={collapsed}
									isOpen={open}
									isActive={active}
									onNavigate={() => setMobileOpen(false)}
									onToggle={() => {
										if (collapsed) {
											setCollapsed(false)
											return
										}
										setOpenGroups((prev) => ({ ...prev, [groupKey]: !open }))
									}}
								/>
							)
						})}
					</nav>

					<div className={cx('rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)]', collapsed ? 'p-3' : 'p-4')}>
						<div className="flex items-center gap-3">
							<div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--surface-strong)] text-sm font-semibold text-[color:var(--text)]">
								{pickInitial(authUser?.displayName || authUser?.email)}
							</div>
							{collapsed ? null : (
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-[color:var(--text)]">{authUser?.displayName || 'Admin'}</p>
									<p className="truncate text-xs font-semibold text-muted">{authUser?.email || 'Signed in'}</p>
								</div>
							)}
						</div>
					</div>

					<div className="mt-auto pt-2">
						<div className={cx('border-t border-[color:var(--ring)] pt-3', collapsed ? 'px-0' : 'px-0')}>
							<SidebarLink
								to="/logout"
								label="Logout"
								icon={LogOut}
								collapsed={collapsed}
								kind="danger"
								onNavigate={() => setMobileOpen(false)}
							/>
						</div>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="glass-panel sticky top-0 z-30 mx-4 mt-4 rounded-[var(--radius)] px-4 py-4 sm:mx-6 sm:mt-6 sm:px-6">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<h1 className="text-xl font-bold uppercase tracking-widest text-slate-900">Admin Dashboard</h1>
								<nav className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
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
