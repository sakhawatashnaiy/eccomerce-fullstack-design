/**
 * Orders page.
 * Fetches the signed-in user's orders from the backend (`/orders/me`).
 */

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box, CalendarClock, CreditCard, PackageCheck, ReceiptText } from 'lucide-react'
import { useDispatch } from 'react-redux'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { isSignedIn } from '../utils/authSession.js'
import { apiSlice, useGetMyOrdersQuery } from '../services/apiSlice.js'

function formatMoney(value) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(Number(value) || 0)
	} catch {
		return `$${Number(value) || 0}`
	}
}

function formatDateTime(value) {
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) return ''
	try {
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		}).format(d)
	} catch {
		return d.toLocaleString()
	}
}

function getStatusStyle(status) {
	const key = String(status || '').toLowerCase()
	if (key === 'pending') return { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-200' }
	if (key === 'paid') return { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
	if (key === 'shipped') return { label: 'Shipped', className: 'bg-sky-50 text-sky-700 ring-sky-200' }
	if (key === 'delivered') return { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
	if (key === 'cancelled' || key === 'canceled') return { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 ring-rose-200' }
	return { label: status ? String(status) : 'Unknown', className: 'bg-slate-50 text-slate-700 ring-slate-200' }
}

function progressFromStatus(status) {
	const key = String(status || '').toLowerCase()
	if (key === 'cancelled' || key === 'canceled') return { state: 'cancelled', index: 0 }
	if (key === 'delivered') return { state: 'delivered', index: 2 }
	if (key === 'shipped') return { state: 'shipped', index: 1 }
	if (key === 'processing') return { state: 'processing', index: 0 }
	return { state: 'pending', index: 0 }
}

function Timeline({ status }) {
	const { state, index } = progressFromStatus(status)
	const steps = ['Placed', 'Shipped', 'Delivered']

	if (state === 'cancelled') {
		return (
			<div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
				<p className="text-xs font-semibold text-rose-700">Order cancelled</p>
				<p className="mt-1 text-xs text-rose-700/90">If this is unexpected, contact support.</p>
			</div>
		)
	}

	return (
		<div className="mt-4">
			<p className="text-xs font-semibold text-slate-600">Delivery progress</p>
			<div className="mt-2 grid grid-cols-3 gap-2">
				{steps.map((label, i) => {
					const done = i <= index
					return (
						<div
							key={label}
							className={[
								'rounded-xl px-3 py-2 ring-1',
								done
									? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
									: 'bg-slate-50 text-slate-700 ring-slate-200',
							].join(' ')}
						>
							<p className="text-[11px] font-semibold">{label}</p>
							<p className="mt-1 text-[11px] text-slate-600">{done ? 'Done' : 'Pending'}</p>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function safeItems(order) {
	return Array.isArray(order?.items) ? order.items : []
}

function getItemLabel(item) {
	return String(item?.title || item?.name || item?.productTitle || item?.productName || 'Item')
}

function countItems(items) {
	return items.reduce((sum, item) => sum + (Number(item?.qty) || 1), 0)
}

function orderTotal(order) {
	const total = order?.total
	if (typeof total === 'number') return total
	const subtotal = Number(order?.subtotal) || 0
	const shipping = Number(order?.shipping) || 0
	const tax = Number(order?.tax) || 0
	return subtotal + shipping + tax
}

export default function Orders() {
	const shouldReduceMotion = useReducedMotion()
	const MotionArticle = motion.article
	const dispatch = useDispatch()
	const signedIn = isSignedIn()
	const {
		data: orders = [],
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useGetMyOrdersQuery(undefined, { skip: !signedIn })

	const onRefresh = async () => {
		if (!signedIn) return
		dispatch(apiSlice.util.invalidateTags([{ type: 'Orders', id: 'LIST' }]))
		try {
			await refetch()
		} catch {
			// If the query was never started (rare), invalidation is still enough.
		}
	}

	const sorted = useMemo(() => {
		return [...orders].sort((a, b) => {
			const da = new Date(a?.createdAt || 0).getTime()
			const db = new Date(b?.createdAt || 0).getTime()
			return db - da
		})
	}, [orders])

	const stats = useMemo(() => {
		const totalOrders = sorted.length
		const spent = sorted.reduce((sum, o) => sum + (Number(orderTotal(o)) || 0), 0)
		const last = sorted[0]?.createdAt ? formatDateTime(sorted[0].createdAt) : ''
		return { totalOrders, spent, last }
	}, [sorted])

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
							<div className="relative px-6 py-7 sm:px-8 sm:py-8">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold text-slate-600">Account</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Your orders</h1>
							<p className="mt-2 max-w-2xl text-sm text-slate-600">
								Track recent purchases, review items, and see delivery progress at a glance.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/products"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
							>
								← Continue shopping
							</Link>
							{signedIn ? (
								<button
									type="button"
									onClick={onRefresh}
									disabled={isFetching}
									className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isFetching ? 'Refreshing…' : 'Refresh'}
								</button>
							) : null}
						</div>
								</div>

								{signedIn ? (
									<div className="mt-6 grid gap-3 sm:grid-cols-3">
										<div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
											<div className="flex items-center justify-between">
												<p className="text-xs font-semibold text-slate-600">Total orders</p>
												<ReceiptText className="h-4 w-4 text-slate-500" aria-hidden="true" />
											</div>
											<p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{stats.totalOrders}</p>
										</div>
										<div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
											<div className="flex items-center justify-between">
												<p className="text-xs font-semibold text-slate-600">Total spent</p>
												<CreditCard className="h-4 w-4 text-slate-500" aria-hidden="true" />
											</div>
											<p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{formatMoney(stats.spent)}</p>
										</div>
										<div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
											<div className="flex items-center justify-between">
												<p className="text-xs font-semibold text-slate-600">Latest order</p>
												<CalendarClock className="h-4 w-4 text-slate-500" aria-hidden="true" />
											</div>
											<p className="mt-2 text-sm font-semibold text-slate-900">{stats.last || '—'}</p>
										</div>
									</div>
								) : null}
							</div>
						</div>
					</div>

					{!signedIn ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
							<div className="p-7 sm:p-10">
								<h2 className="text-xl font-semibold text-slate-900">Sign in to view your orders</h2>
								<p className="mt-2 text-sm text-slate-600">
									Orders are tied to your account. Sign in to fetch them securely.
								</p>
								<div className="mt-6 flex flex-col gap-3 sm:flex-row">
									<Link
										to="/login"
										className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
									>
										Sign in
									</Link>
									<Link
										to="/signup"
										className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
									>
										Create account
									</Link>
								</div>
							</div>
						</div>
					) : isLoading ? (
						<div className="mt-8 grid gap-6 lg:grid-cols-12">
							<section className="lg:col-span-8">
								<div className="space-y-4">
									{[0, 1, 2].map((i) => (
										<div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
											<div className="p-6">
												<div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
												<div className="mt-3 h-3 w-60 animate-pulse rounded bg-slate-100" />
												<div className="mt-6 grid grid-cols-3 gap-3">
													<div className="h-10 animate-pulse rounded bg-slate-100" />
													<div className="h-10 animate-pulse rounded bg-slate-100" />
													<div className="h-10 animate-pulse rounded bg-slate-100" />
												</div>
											</div>
										</div>
									))}
								</div>
							</section>
							<aside className="lg:col-span-4">
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-6 py-4">
										<p className="text-sm font-semibold text-slate-900">Summary</p>
									</div>
									<div className="space-y-3 px-6 py-6">
										<div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
										<div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
										<div className="h-10 w-full animate-pulse rounded bg-slate-100" />
									</div>
								</div>
							</aside>
						</div>
					) : isError ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
							<div className="p-7 sm:p-10">
								<h2 className="text-xl font-semibold text-rose-900">Could not load your orders</h2>
								<p className="mt-2 text-sm text-rose-700">
									{typeof error === 'object' && error && 'status' in error
										? `Request failed. (${String(error.status)})`
										: 'Check your backend connection and that you are signed in.'}
								</p>
								<div className="mt-6 flex flex-col gap-3 sm:flex-row">
									<button
										type="button"
										onClick={onRefresh}
										disabled={isFetching}
										className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-rose-900 ring-1 ring-rose-200 transition-colors hover:bg-rose-100/40 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{isFetching ? 'Refreshing…' : 'Try again'}
									</button>
									<Link
										to="/login"
										className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
									>
										Sign in
									</Link>
								</div>
							</div>
						</div>
					) : sorted.length === 0 ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
							<div className="p-7 sm:p-10">
								<h2 className="text-xl font-semibold text-slate-900">No orders yet</h2>
								<p className="mt-2 text-sm text-slate-600">When you place an order, it will show up here.</p>
								<div className="mt-6">
									<Link
										to="/products"
										className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
									>
										Browse products
									</Link>
								</div>
							</div>
						</div>
					) : (
						<div className="mt-8 grid gap-6 lg:grid-cols-12">
							<section className="lg:col-span-8">
								<div className="space-y-4">
									{sorted.map((order, index) => {
										const items = safeItems(order)
										const itemCount = countItems(items)
										const total = orderTotal(order)
										const status = getStatusStyle(order?.status)
										const created = formatDateTime(order?.createdAt)
										const shortId = String(order?.id || '').slice(0, 8)
										const paymentMethod = String(order?.payment?.method || '').toUpperCase() || '—'

										return (
											<MotionArticle
												key={order?.id || index}
												className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300"
												initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
												animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
												transition={{ duration: 0.22, ease: 'easeOut', delay: Math.min(index * 0.045, 0.24) }}
											>
												<div className="p-6">
													<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
														<div>
															<p className="text-xs font-semibold text-slate-600">Order</p>
															<p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
																#{shortId || '—'}
															</p>
															<p className="mt-1 text-sm text-slate-600">{created}</p>
														</div>
														<div className="flex items-center gap-2">
															<span
																className={[
																	'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
																	status.className,
																].join(' ')}
															>
																{status.label}
															</span>
															<span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
																<PackageCheck className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
																{formatMoney(total)}
															</span>
														</div>
													</div>

													<div className="mt-5 grid gap-3 sm:grid-cols-3">
														<div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
															<p className="text-xs font-semibold text-slate-600">Items</p>
															<p className="mt-1 text-sm font-semibold text-slate-900">{itemCount}</p>
														</div>
														<div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
															<p className="text-xs font-semibold text-slate-600">Payment</p>
															<p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
																<CreditCard className="h-4 w-4 text-slate-500" aria-hidden="true" />
																{paymentMethod}
															</p>
														</div>
														<div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
															<p className="text-xs font-semibold text-slate-600">Total</p>
															<p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(total)}</p>
														</div>
													</div>

													<Timeline status={order?.status} />

														{items.length ? (
														<div className="mt-5">
															<p className="text-xs font-semibold text-slate-600">Items preview</p>
															<ul className="mt-2 space-y-1 text-sm text-slate-700">
																{items.slice(0, 3).map((item, i) => (
																	<li key={i} className="flex items-center justify-between gap-3">
																			<span className="flex min-w-0 items-center gap-2">
																				<Box className="h-4 w-4 text-slate-400" aria-hidden="true" />
																				<span className="truncate">{getItemLabel(item)}</span>
																			</span>
																		<span className="shrink-0 text-xs font-semibold text-slate-600">×{Number(item?.qty) || 1}</span>
																	</li>
																))}
																{items.length > 3 ? (
																	<li className="text-xs font-semibold text-slate-500">+{items.length - 3} more…</li>
																) : null}
															</ul>
														</div>
													) : null}
												</div>
											</MotionArticle>
										)
									})}
								</div>
							</section>

							<aside className="lg:col-span-4">
								<div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-6 py-4">
										<p className="text-sm font-semibold text-slate-900">Summary</p>
										<p className="mt-1 text-sm text-slate-600">A quick snapshot of your account activity.</p>
									</div>
									<div className="space-y-3 px-6 py-6">
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-600">Total orders</span>
											<span className="font-semibold text-slate-900">{stats.totalOrders}</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-600">Total spent</span>
											<span className="font-semibold text-slate-900">{formatMoney(stats.spent)}</span>
										</div>
										{stats.last ? (
											<div className="flex items-center justify-between text-sm">
												<span className="text-slate-600">Latest order</span>
												<span className="font-semibold text-slate-900">{stats.last}</span>
											</div>
										) : null}
										<div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
											<p className="text-xs font-semibold text-slate-600">Tip</p>
											<p className="mt-1 text-xs text-slate-600">
												Keep your account secure and always sign out on shared devices.
											</p>
										</div>
										<div className="pt-3">
											<Link
												to="/products"
												className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
											>
												Shop again
											</Link>
										</div>
									</div>
								</div>
							</aside>
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	)
}

