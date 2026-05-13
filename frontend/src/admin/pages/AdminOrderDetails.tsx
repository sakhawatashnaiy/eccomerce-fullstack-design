/**
 * Admin order details page.
 * Shows full order info and allows status transitions.
 */

import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { apiSlice, useGetAdminOrderByIdQuery, usePatchAdminOrderMutation } from '../../services/apiSlice.js'

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
		slate: 'bg-slate-100 text-slate-700 ring-slate-200',
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

function extractErrorMessage(error) {
	return (
		error?.data?.message ||
		error?.data?.error ||
		error?.error ||
		error?.message ||
		'Something went wrong. Please try again.'
	)
}

export default function AdminOrderDetails() {
	const navigate = useNavigate()
	const { id } = useParams()
	const dispatch = useDispatch()

	const { data: order, isLoading, isFetching, isError, error, refetch } = useGetAdminOrderByIdQuery(id)
	const [patchOrder, { isLoading: isSaving }] = usePatchAdminOrderMutation()

	const onRefresh = async () => {
		if (!id) return
		dispatch(apiSlice.util.invalidateTags([{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }]))
		try {
			await refetch()
		} catch {
			// invalidation above still triggers a refetch for active subscribers
		}
	}

	const [toast, setToast] = useState(null)
	useEffect(() => {
		if (!toast) return
		const t = window.setTimeout(() => setToast(null), 3200)
		return () => window.clearTimeout(t)
	}, [toast])

	const items = useMemo(() => (Array.isArray(order?.items) ? order.items : []), [order])
	const status = String(order?.status || 'pending').toLowerCase()
	const paymentMethod = String(order?.payment?.method || 'cod').toLowerCase()
	const paymentStatus = String(order?.payment?.status || 'unpaid').toLowerCase()

	const canShip = status === 'pending'
	const canDeliver = status === 'shipped'
	const canCancel = status === 'pending'

	const onUpdateStatus = async (nextStatus) => {
		try {
			await patchOrder({ id, status: nextStatus }).unwrap()
			setToast({ type: 'success', message: `Order marked as ${nextStatus}.` })
		} catch (e) {
			setToast({ type: 'error', message: extractErrorMessage(e) })
		}
	}

	const onCancel = async () => {
		const ok = window.confirm('Cancel this order? This cannot be undone.')
		if (!ok) return
		await onUpdateStatus('cancelled')
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />
			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold text-slate-600">Admin panel</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Order details
							</h1>
							<p className="mt-2 text-sm text-slate-600">Review items, customer info, payment, and status.</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/admin/orders"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
							>
								← Back
							</Link>
							<button
								type="button"
								onClick={onRefresh}
								disabled={isFetching}
								className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isFetching ? 'Refreshing…' : 'Refresh'}
							</button>
						</div>
					</div>

					{toast ? (
						<div
							className={
								'mt-6 rounded-2xl px-5 py-4 text-sm ring-1 animate-fade-up ' +
								(toast.type === 'success'
									? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
									: 'bg-rose-50 text-rose-700 ring-rose-200')
							}
						>
							{toast.message}
						</div>
					) : null}

					{isLoading ? (
						<div className="mt-8 grid gap-4 lg:grid-cols-3">
							<div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
							<div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
							<div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-3" />
						</div>
					) : isError ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
							<div className="px-6 py-6">
								<p className="text-sm font-semibold text-rose-800">Couldn’t load this order</p>
								<p className="mt-2 text-sm text-rose-700">{String(extractErrorMessage(error))}</p>
								<div className="mt-4 flex flex-wrap gap-2">
									<button
										type="button"
										onClick={onRefresh}
										className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
									>
										Try again
									</button>
									<button
										type="button"
										onClick={() => navigate('/admin/orders')}
										className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-rose-50"
									>
										Back to orders
									</button>
								</div>
							</div>
						</div>
					) : !order ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
							<div className="px-6 py-10 text-center">
								<p className="text-sm font-semibold text-slate-900">Order not found</p>
							</div>
						</div>
					) : (
						<div className="mt-8 grid gap-6 lg:grid-cols-12">
							<section className="lg:col-span-8">
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-6 py-5">
										<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
											<div>
												<p className="text-xs font-semibold text-slate-500">Order ID</p>
												<p className="mt-1 text-lg font-semibold text-slate-900">#{order.id}</p>
												<p className="mt-1 text-sm text-slate-600">Placed {formatDate(order.createdAt)}</p>
											</div>
											<div className="flex flex-wrap items-center gap-2">
												<Badge tone={getPaymentTone(paymentStatus)}>{paymentStatus}</Badge>
												<Badge tone={getStatusTone(status)}>{status}</Badge>
											</div>
										</div>
									</div>

									<div className="px-6 py-6">
										<div className="grid gap-5 sm:grid-cols-2">
											<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
												<p className="text-sm font-semibold text-slate-900">Customer</p>
												<div className="mt-3 space-y-1 text-sm text-slate-700">
													<p>
														<span className="font-semibold text-slate-900">Name:</span> {order.customer?.name || '—'}
													</p>
													<p className="break-words">
														<span className="font-semibold text-slate-900">Email:</span> {order.customer?.email || '—'}
													</p>
													<p>
														<span className="font-semibold text-slate-900">Phone:</span> {order.customer?.phone || '—'}
													</p>
												</div>
											</div>

											<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
												<p className="text-sm font-semibold text-slate-900">Shipping address</p>
												<div className="mt-3 text-sm text-slate-700">
													<p>{order.shippingAddress?.line1 || '—'}</p>
													{order.shippingAddress?.line2 ? <p>{order.shippingAddress.line2}</p> : null}
													<p>
														{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode]
															.filter(Boolean)
															.join(', ') || '—'}
													</p>
													<p>{order.shippingAddress?.country || ''}</p>
												</div>
											</div>
										</div>

										<div className="mt-5 grid gap-5 sm:grid-cols-2">
											<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
												<p className="text-sm font-semibold text-slate-900">Payment</p>
												<div className="mt-3 space-y-1 text-sm text-slate-700">
													<p>
														<span className="font-semibold text-slate-900">Method:</span> {paymentMethod}
													</p>
													<p>
														<span className="font-semibold text-slate-900">Status:</span> {paymentStatus}
													</p>
													<p className="break-words">
														<span className="font-semibold text-slate-900">Transaction:</span>{' '}
														{order.payment?.transactionId || '—'}
													</p>
												</div>
											</div>

											<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
												<p className="text-sm font-semibold text-slate-900">Totals</p>
												<div className="mt-3 space-y-1 text-sm text-slate-700">
													<p className="flex items-center justify-between">
														<span>Subtotal</span>
														<span className="font-semibold text-slate-900">{formatMoney(order.subtotal)}</span>
													</p>
													<p className="flex items-center justify-between">
														<span>Shipping</span>
														<span className="font-semibold text-slate-900">{formatMoney(order.shipping)}</span>
													</p>
													<p className="flex items-center justify-between">
														<span>Tax</span>
														<span className="font-semibold text-slate-900">{formatMoney(order.tax)}</span>
													</p>
													<div className="my-2 h-px w-full bg-slate-200" />
													<p className="flex items-center justify-between text-base">
														<span className="font-semibold text-slate-900">Total</span>
														<span className="font-semibold text-slate-900">{formatMoney(order.total)}</span>
													</p>
												</div>
											</div>
										</div>
									</div>

									<div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
										<div className="bg-white px-6 py-4">
											<p className="text-sm font-semibold text-slate-900">Products</p>
											<p className="mt-1 text-sm text-slate-600">{items.length} item(s)</p>
										</div>
										<div className="divide-y divide-slate-200 bg-white">
											{items.map((item, idx) => (
												<div key={`${item?.id || item?.name || idx}`} className="flex items-center gap-4 px-6 py-4">
													<div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
														{item?.image ? (
															<img src={item.image} alt={item?.name || 'Product'} className="h-full w-full object-cover" />
														) : null}
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate font-semibold text-slate-900">{item?.name || 'Product'}</p>
														<p className="mt-1 text-sm text-slate-600">
															Qty {Number(item?.qty) || 0} · {formatMoney(item?.price)}
														</p>
													</div>
													<div className="text-right text-sm font-semibold text-slate-900">
														{formatMoney((Number(item?.price) || 0) * (Number(item?.qty) || 0))}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</section>

							<aside className="lg:col-span-4">
								<div className="rounded-2xl border border-slate-200 bg-white p-6">
									<p className="text-sm font-semibold text-slate-900">Update status</p>
									<p className="mt-2 text-sm text-slate-600">Follow the allowed flow: pending → shipped → delivered.</p>

									<div className="mt-5 grid gap-2">
										<button
											type="button"
											disabled={!canShip || isSaving}
											onClick={() => onUpdateStatus('shipped')}
											className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{isSaving && canShip ? 'Saving...' : 'Mark as shipped'}
										</button>
										<button
											type="button"
											disabled={!canDeliver || isSaving}
											onClick={() => onUpdateStatus('delivered')}
											className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{isSaving && canDeliver ? 'Saving...' : 'Mark as delivered'}
										</button>
										<button
											type="button"
											disabled={!canCancel || isSaving}
											onClick={onCancel}
											className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Cancel order
										</button>
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
