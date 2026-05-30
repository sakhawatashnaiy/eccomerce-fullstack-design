/**
 * Admin orders list page.
 * Shows all orders for admins with quick navigation to details.
 */

import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import AdminLayout from '../../components/admin/AdminLayout.jsx'
import { apiSlice, useGetAdminOrdersQuery } from '../../services/apiSlice.js'

function formatMoney(value) {
	const n = Number(value) || 0
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(n)
	} catch {
		return `$${n}`
	}
}

function formatDate(value) {
	if (!value) return ''
	try {
		return new Date(value).toLocaleString()
	} catch {
		return String(value)
	}
}

function Badge({ tone = 'slate', children }) {
	const tones = {
		slate: 'bg-[color:var(--surface-strong)] text-[color:var(--text)] ring-[color:var(--ring)]',
		amber: 'bg-amber-50 text-amber-700 ring-amber-200',
		emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
		rose: 'bg-rose-50 text-rose-700 ring-rose-200',
		indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
	}

	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone] || tones.slate}`}>
			{children}
		</span>
	)
}

function getStatusTone(status) {
	switch (String(status || '').toLowerCase()) {
		case 'pending':
			return 'amber'
		case 'shipped':
			return 'indigo'
		case 'delivered':
			return 'emerald'
		case 'cancelled':
			return 'rose'
		default:
			return 'slate'
	}
}

function getPaymentTone(status) {
	switch (String(status || '').toLowerCase()) {
		case 'paid':
			return 'emerald'
		case 'unpaid':
			return 'amber'
		case 'refunded':
			return 'rose'
		default:
			return 'slate'
	}
}

export default function AdminOrders() {
	const dispatch = useDispatch()
	const {
		data: orders = [],
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useGetAdminOrdersQuery()

	const onRefresh = async () => {
		dispatch(apiSlice.util.invalidateTags([{ type: 'Orders', id: 'LIST' }]))
		try {
			await refetch()
		} catch {
			// invalidation above still triggers a refetch for active subscribers
		}
	}

	const errorMessage =
		error?.data?.message || error?.data?.error || error?.error || 'Could not load orders. Please try again.'

	return (
		<AdminLayout breadcrumbs={[{ label: 'Orders', to: '/admin/orders' }]}>
			<div className="space-y-6">
				<section className="surface-card p-5 sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-muted">Admin panel</p>
							<h1 className="mt-2 text-2xl font-semibold text-[color:var(--text)] sm:text-3xl">Orders</h1>
							<p className="mt-2 text-sm text-muted">Review customer orders and update fulfillment status.</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/admin/products"
								className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-strong)]"
							>
								Products
							</Link>
							<button
								type="button"
								onClick={onRefresh}
								disabled={isFetching}
								className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,90,31,0.25)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isFetching ? 'Refreshing…' : 'Refresh'}
							</button>
						</div>
					</div>
				</section>

					{isLoading ? (
						<div className="grid gap-4 md:grid-cols-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="h-28 animate-shimmer rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)]"
								/>
							))}
						</div>
					) : isError ? (
						<div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
							<div className="px-6 py-6">
								<p className="text-sm font-semibold text-rose-800">Couldn’t load orders</p>
								<p className="mt-2 text-sm text-rose-700">{String(errorMessage)}</p>
								<div className="mt-4">
									<button
										type="button"
										onClick={onRefresh}
										className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
									>
										Try again
									</button>
								</div>
							</div>
						</div>
					) : orders.length === 0 ? (
						<div className="overflow-hidden rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)]">
							<div className="px-6 py-10 text-center">
								<p className="text-sm font-semibold text-[color:var(--text)]">No orders yet</p>
								<p className="mt-2 text-sm text-muted">Once customers place orders, they’ll show up here.</p>
							</div>
						</div>
					) : (
						<div>
							{/* Mobile cards */}
							<div className="grid gap-4 sm:grid-cols-2 lg:hidden">
								{orders.map((order) => (
									<Link
										key={order.id}
										to={`/admin/orders/${order.id}`}
										className="group rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow"
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-xs font-semibold text-muted">Order</p>
												<p className="mt-1 font-semibold text-[color:var(--text)]">#{String(order.id).slice(0, 10)}</p>
											</div>
											<div className="flex flex-col items-end gap-2">
												<Badge tone={getStatusTone(order.status)}>{String(order.status || 'pending')}</Badge>
												<Badge tone={getPaymentTone(order.payment?.status)}>
													{String(order.payment?.status || 'unpaid')}
												</Badge>
											</div>
										</div>

										<div className="mt-4 grid gap-2 text-sm text-muted">
											<p>
												<span className="font-semibold text-[color:var(--text)]">Customer:</span>{' '}
												{order.customer?.name || '—'}
											</p>
											<p className="truncate">
												<span className="font-semibold text-[color:var(--text)]">Email:</span>{' '}
												{order.customer?.email || '—'}
											</p>
											<p>
												<span className="font-semibold text-[color:var(--text)]">Phone:</span>{' '}
												{order.customer?.phone || '—'}
											</p>
										</div>

										<div className="mt-4 flex items-center justify-between text-sm">
											<p className="font-semibold text-[color:var(--text)]">{formatMoney(order.total)}</p>
											<p className="text-muted">{formatDate(order.createdAt)}</p>
										</div>
									</Link>
								))}
							</div>

							{/* Desktop table */}
							<div className="hidden overflow-hidden rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] lg:block">
								<div className="overflow-x-auto">
										<table className="min-w-full text-sm">
											<thead className="bg-[color:var(--surface-strong)] text-left text-xs font-semibold uppercase tracking-wide text-muted">
											<tr>
												<th className="px-6 py-4">Order ID</th>
												<th className="px-6 py-4">Customer</th>
												<th className="px-6 py-4">Email</th>
												<th className="px-6 py-4">Phone</th>
												<th className="px-6 py-4">Total</th>
												<th className="px-6 py-4">Payment</th>
												<th className="px-6 py-4">Status</th>
												<th className="px-6 py-4">Date</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-[color:var(--ring)]">
											{orders.map((order) => (
													<tr key={order.id} className="hover:bg-[color:var(--surface-strong)]">
														<td className="px-6 py-4 font-semibold text-[color:var(--text)]">
														<Link className="hover:underline" to={`/admin/orders/${order.id}`}>
															#{String(order.id).slice(0, 12)}
														</Link>
													</td>
														<td className="px-6 py-4 text-muted">{order.customer?.name || '—'}</td>
														<td className="px-6 py-4 text-muted">{order.customer?.email || '—'}</td>
														<td className="px-6 py-4 text-muted">{order.customer?.phone || '—'}</td>
														<td className="px-6 py-4 font-semibold text-[color:var(--text)]">{formatMoney(order.total)}</td>
													<td className="px-6 py-4">
														<Badge tone={getPaymentTone(order.payment?.status)}>
															{String(order.payment?.status || 'unpaid')}
														</Badge>
													</td>
													<td className="px-6 py-4">
														<Badge tone={getStatusTone(order.status)}>{String(order.status || 'pending')}</Badge>
													</td>
														<td className="px-6 py-4 text-muted">{formatDate(order.createdAt)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
			</div>
		</AdminLayout>
	)
}
