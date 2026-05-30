/**
 * Admin order details page.
 * Shows full order info and allows status transitions.
 */

import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import AdminLayout from '../../components/admin/AdminLayout.jsx'
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
	const [alertModal, setAlertModal] = useState({ open: false, mode: 'review', label: '' })
	const [trackingNumber, setTrackingNumber] = useState('')
	const [reviewNote, setReviewNote] = useState('')
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

	const priorityAlerts = useMemo(() => {
		const alerts = []
		const total = Number(order?.total) || 0
		const hasTracking = Boolean(order?.tracking?.number)
		const shippingCountry = String(order?.shippingAddress?.country || '')

		if (paymentStatus === 'unpaid') {
			alerts.push({
				label: 'Payment pending',
				detail: 'Confirm payment before dispatching.',
				tone: 'amber',
			})
		}

		if (status === 'pending') {
			alerts.push({
				label: 'Fulfillment delay',
				detail: 'Ship within 12h to protect SLA score.',
				tone: 'rose',
			})
		}

		if (total >= 500) {
			alerts.push({
				label: 'High value order',
				detail: 'Manual review recommended for fraud checks.',
				tone: 'indigo',
			})
		}

		if (!hasTracking && status !== 'delivered') {
			alerts.push({
				label: 'Missing tracking',
				detail: 'Add tracking to reduce customer tickets.',
				tone: 'amber',
			})
		}

		if (shippingCountry && shippingCountry !== 'US') {
			alerts.push({
				label: 'Cross-border order',
				detail: 'Verify customs invoice and HS codes.',
				tone: 'slate',
			})
		}

		return alerts.slice(0, 4)
	}, [order, paymentStatus, status])

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

	const openAlertModal = (mode, label) => {
		setAlertModal({ open: true, mode, label })
	}

	const closeAlertModal = () => {
		setAlertModal({ open: false, mode: 'review', label: '' })
		setTrackingNumber('')
		setReviewNote('')
	}

	const submitAlertAction = async () => {
		if (!id) return
		if (alertModal.mode === 'tracking' && !trackingNumber.trim()) {
			setToast({ type: 'error', message: 'Add a tracking number before resolving.' })
			return
		}
		if (alertModal.mode === 'review' && !reviewNote.trim()) {
			setToast({ type: 'error', message: 'Add a short review note for this alert.' })
			return
		}

		try {
			if (alertModal.mode === 'tracking') {
				await patchOrder({ id, tracking: { number: trackingNumber.trim() } }).unwrap()
			} else {
				await patchOrder({
					id,
					adminNote: reviewNote.trim(),
					adminNoteLabel: alertModal.label,
					adminNoteBy: 'admin',
				}).unwrap()
			}
			setToast({ type: 'success', message: `Alert resolved: ${alertModal.label}.` })
			closeAlertModal()
		} catch (error) {
			setToast({ type: 'error', message: extractErrorMessage(error) })
		}
	}

	return (
		<AdminLayout breadcrumbs={[{ label: 'Orders', to: '/admin/orders' }, { label: 'Details', to: `/admin/orders/${id}` }]}>
			<div className="space-y-6">
				{alertModal.open ? (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
						<div className="surface-card w-full max-w-lg p-6">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-widest text-muted">Alert action</p>
									<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">{alertModal.label}</h3>
									<p className="mt-2 text-sm text-muted">
										{alertModal.mode === 'tracking'
											? 'Attach a tracking number to close this alert.'
											: 'Add a review note and flag this order for follow-up.'}
									</p>
								</div>
								<button
									type="button"
									onClick={closeAlertModal}
									className="rounded-xl border border-[color:var(--ring)] px-3 py-1 text-xs font-semibold text-muted hover:bg-[color:var(--surface-strong)]"
								>
									Close
								</button>
							</div>

							{alertModal.mode === 'tracking' ? (
								<div className="mt-5">
									<label htmlFor="tracking-number" className="text-sm font-semibold text-[color:var(--text)]">
										Tracking number
									</label>
									<input
										id="tracking-number"
										value={trackingNumber}
										onChange={(event) => setTrackingNumber(event.target.value)}
										placeholder="Enter carrier tracking code"
										className="mt-2 h-11 w-full rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
									/>
								</div>
							) : (
								<div className="mt-5">
									<label htmlFor="review-note" className="text-sm font-semibold text-[color:var(--text)]">
										Review note
									</label>
									<textarea
										id="review-note"
										value={reviewNote}
										onChange={(event) => setReviewNote(event.target.value)}
										rows={3}
										placeholder="Reason for manual review"
										className="mt-2 w-full rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
									/>
								</div>
							)}

							<div className="mt-6 flex flex-wrap justify-end gap-2">
								<button
									type="button"
									onClick={closeAlertModal}
									className="rounded-xl border border-[color:var(--ring)] px-4 py-2 text-sm font-semibold text-muted hover:bg-[color:var(--surface-strong)]"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={submitAlertAction}
									className="rounded-xl bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,90,31,0.25)] hover:opacity-90"
								>
									Resolve alert
								</button>
							</div>
						</div>
					</div>
				) : null}
				<section className="surface-card p-5 sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-muted">Admin panel</p>
							<h1 className="mt-2 text-2xl font-semibold text-[color:var(--text)] sm:text-3xl">Order details</h1>
							<p className="mt-2 text-sm text-muted">Review items, customer info, payment, and status.</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/admin/orders"
								className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-strong)]"
							>
								← Back
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

					{toast ? (
						<div
							className={
								'rounded-2xl px-5 py-4 text-sm ring-1 animate-fade-up ' +
								(toast.type === 'success'
									? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
									: 'bg-rose-50 text-rose-700 ring-rose-200')
							}
						>
							{toast.message}
						</div>
					) : null}

					{isLoading ? (
						<div className="grid gap-4 lg:grid-cols-3">
							<div className="h-48 animate-shimmer rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] lg:col-span-2" />
							<div className="h-48 animate-shimmer rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)]" />
							<div className="h-72 animate-shimmer rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] lg:col-span-3" />
						</div>
					) : isError ? (
						<div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
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
										className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[color:var(--text)] ring-1 ring-rose-200 hover:bg-rose-50"
									>
										Back to orders
									</button>
								</div>
							</div>
						</div>
					) : !order ? (
						<div className="overflow-hidden rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)]">
							<div className="px-6 py-10 text-center">
								<p className="text-sm font-semibold text-[color:var(--text)]">Order not found</p>
							</div>
						</div>
					) : (
						<div className="grid gap-6 lg:grid-cols-12">
							<section className="lg:col-span-8">
								<div className="overflow-hidden rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)]">
									<div className="border-b border-[color:var(--ring)] px-6 py-5">
										<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
											<div>
												<p className="text-xs font-semibold text-muted">Order ID</p>
												<p className="mt-1 text-lg font-semibold text-[color:var(--text)]">#{order.id}</p>
												<p className="mt-1 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
											</div>
											<div className="flex flex-wrap items-center gap-2">
												<Badge tone={getPaymentTone(paymentStatus)}>{paymentStatus}</Badge>
												<Badge tone={getStatusTone(status)}>{status}</Badge>
											</div>
										</div>
									</div>

									<div className="px-6 py-6">
										<div className="grid gap-5 sm:grid-cols-2">
											<div className="rounded-2xl bg-[color:var(--surface-strong)] p-5 ring-1 ring-[color:var(--ring)]">
												<p className="text-sm font-semibold text-[color:var(--text)]">Customer</p>
												<div className="mt-3 space-y-1 text-sm text-muted">
													<p>
														<span className="font-semibold text-[color:var(--text)]">Name:</span> {order.customer?.name || '—'}
													</p>
													<p className="break-words">
														<span className="font-semibold text-[color:var(--text)]">Email:</span> {order.customer?.email || '—'}
													</p>
													<p>
														<span className="font-semibold text-[color:var(--text)]">Phone:</span> {order.customer?.phone || '—'}
													</p>
												</div>
											</div>

											<div className="rounded-2xl bg-[color:var(--surface-strong)] p-5 ring-1 ring-[color:var(--ring)]">
												<p className="text-sm font-semibold text-[color:var(--text)]">Shipping address</p>
												<div className="mt-3 text-sm text-muted">
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
											<div className="rounded-2xl bg-[color:var(--surface-strong)] p-5 ring-1 ring-[color:var(--ring)]">
												<p className="text-sm font-semibold text-[color:var(--text)]">Payment</p>
												<div className="mt-3 space-y-1 text-sm text-muted">
													<p>
														<span className="font-semibold text-[color:var(--text)]">Method:</span> {paymentMethod}
													</p>
													<p>
														<span className="font-semibold text-[color:var(--text)]">Status:</span> {paymentStatus}
													</p>
													<p className="break-words">
														<span className="font-semibold text-[color:var(--text)]">Transaction:</span>{' '}
														{order.payment?.transactionId || '—'}
													</p>
												</div>
											</div>

											<div className="rounded-2xl bg-[color:var(--surface-strong)] p-5 ring-1 ring-[color:var(--ring)]">
												<p className="text-sm font-semibold text-[color:var(--text)]">Totals</p>
												<div className="mt-3 space-y-1 text-sm text-muted">
													<p className="flex items-center justify-between">
														<span>Subtotal</span>
														<span className="font-semibold text-[color:var(--text)]">{formatMoney(order.subtotal)}</span>
													</p>
													<p className="flex items-center justify-between">
														<span>Shipping</span>
														<span className="font-semibold text-[color:var(--text)]">{formatMoney(order.shipping)}</span>
													</p>
													<p className="flex items-center justify-between">
														<span>Tax</span>
														<span className="font-semibold text-[color:var(--text)]">{formatMoney(order.tax)}</span>
													</p>
													<div className="my-2 h-px w-full bg-[color:var(--ring)]" />
													<p className="flex items-center justify-between text-base">
														<span className="font-semibold text-[color:var(--text)]">Total</span>
														<span className="font-semibold text-[color:var(--text)]">{formatMoney(order.total)}</span>
													</p>
												</div>
											</div>
										</div>
									</div>

									<div className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--ring)]">
										<div className="bg-[color:var(--surface)] px-6 py-4">
											<p className="text-sm font-semibold text-[color:var(--text)]">Products</p>
											<p className="mt-1 text-sm text-muted">{items.length} item(s)</p>
										</div>
										<div className="divide-y divide-[color:var(--ring)] bg-[color:var(--surface)]">
											{items.map((item, idx) => (
												<div key={`${item?.id || item?.name || idx}`} className="flex items-center gap-4 px-6 py-4">
													<div className="h-14 w-14 overflow-hidden rounded-xl bg-[color:var(--surface-strong)] ring-1 ring-[color:var(--ring)]">
														{item?.image ? (
															<img src={item.image} alt={item?.name || 'Product'} className="h-full w-full object-cover" />
														) : null}
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate font-semibold text-[color:var(--text)]">{item?.name || 'Product'}</p>
														<p className="mt-1 text-sm text-muted">
															Qty {Number(item?.qty) || 0} · {formatMoney(item?.price)}
														</p>
													</div>
													<div className="text-right text-sm font-semibold text-[color:var(--text)]">
														{formatMoney((Number(item?.price) || 0) * (Number(item?.qty) || 0))}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</section>

							<aside className="lg:col-span-4">
								<div className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] p-6">
									<p className="text-sm font-semibold text-[color:var(--text)]">Update status</p>
									<p className="mt-2 text-sm text-muted">Follow the allowed flow: pending → shipped → delivered.</p>

									<div className="mt-5 grid gap-2">
										<button
											type="button"
											disabled={!canShip || isSaving}
											onClick={() => onUpdateStatus('shipped')}
											className="inline-flex w-full items-center justify-center rounded-xl bg-[color:var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,90,31,0.25)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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

								<div className="mt-6 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] p-6">
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold text-[color:var(--text)]">Priority alerts</p>
										<span className="text-xs font-semibold text-muted">Auto scored</span>
									</div>
									<div className="mt-4 grid gap-3">
										{priorityAlerts.length ? (
											priorityAlerts.map((alert) => (
												<div
													key={alert.label}
													className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] p-4"
												>
													<div className="flex items-center justify-between">
														<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
															alert.tone === 'rose'
																	? 'bg-rose-50 text-rose-700 ring-rose-200'
																	: alert.tone === 'amber'
																		? 'bg-amber-50 text-amber-700 ring-amber-200'
																		: alert.tone === 'indigo'
																			? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
																			: 'bg-[color:var(--surface)] text-[color:var(--text)] ring-[color:var(--ring)]'
														}}>
															{alert.label}
														</span>
														<span className="text-xs text-muted">Now</span>
													</div>
													<p className="mt-2 text-sm text-muted">{alert.detail}</p>
													<div className="mt-3 flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() => openAlertModal('review', alert.label)}
															className="rounded-xl border border-[color:var(--ring)] px-3 py-1.5 text-xs font-semibold text-muted hover:bg-[color:var(--surface)]"
														>
															Review
														</button>
														<button
															type="button"
															onClick={() => openAlertModal('tracking', alert.label)}
															className="rounded-xl bg-[color:var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
														>
															Resolve
														</button>
													</div>
												</div>
											))
										) : (
											<div className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] p-4 text-sm text-muted">
												No priority alerts right now.
											</div>
										)}
									</div>
								</div>
							</aside>
						</div>
					)}
			</div>
		</AdminLayout>
	)
}
