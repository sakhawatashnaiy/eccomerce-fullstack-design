/**
 * Enterprise admin dashboard command center.
 */

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
	ArrowUpRight,
	BadgeCheck,
	Boxes,
	ChartLine,
	ClipboardList,
	Filter,
	Layers,
	PackageSearch,
	Truck,
	Users,
} from 'lucide-react'

import AdminLayout from '../../components/admin/AdminLayout.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import SalesAnalyticsGraph from '../../components/admin/SalesAnalyticsGraph.jsx'
import { useGetAdminOrdersQuery, useGetProductsQuery } from '../../services/apiSlice.js'

const SALES_DATA = [
	{ week: 'Wk 1', sales: 420000, spend: 180000 },
	{ week: 'Wk 2', sales: 470000, spend: 210000 },
	{ week: 'Wk 3', sales: 520000, spend: 200000 },
	{ week: 'Wk 4', sales: 610000, spend: 240000 },
	{ week: 'Wk 5', sales: 640000, spend: 230000 },
	{ week: 'Wk 6', sales: 700000, spend: 260000 },
	{ week: 'Wk 7', sales: 760000, spend: 280000 },
	{ week: 'Wk 8', sales: 820000, spend: 300000 },
	{ week: 'Wk 9', sales: 790000, spend: 270000 },
	{ week: 'Wk 10', sales: 860000, spend: 320000 },
	{ week: 'Wk 11', sales: 910000, spend: 340000 },
	{ week: 'Wk 12', sales: 980000, spend: 360000 },
]

const GEO_CELLS = [
	{ region: 'North America', value: 86 },
	{ region: 'South America', value: 58 },
	{ region: 'Europe', value: 92 },
	{ region: 'Africa', value: 36 },
	{ region: 'Middle East', value: 49 },
	{ region: 'South Asia', value: 64 },
	{ region: 'East Asia', value: 88 },
	{ region: 'Oceania', value: 41 },
]

const CUSTOMER_SEGMENTS = [
	{ label: 'New', value: 12820, ltv: '$312', trend: '+6.8%' },
	{ label: 'Loyal', value: 4630, ltv: '$1.42k', trend: '+12.1%' },
	{ label: 'At-Risk', value: 1890, ltv: '$220', trend: '-4.2%' },
]

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

function formatNumber(value) {
	return new Intl.NumberFormat().format(Number(value) || 0)
}

function fuzzyMatch(text, query) {
	if (!query) return true
	const q = query.toLowerCase()
	const t = String(text || '').toLowerCase()
	let idx = 0
	for (const ch of q) {
		idx = t.indexOf(ch, idx)
		if (idx === -1) return false
		idx += 1
	}
	return true
}

function InventoryBadge({ status }) {
	const toneMap = {
		Critical: 'bg-rose-50 text-rose-700 ring-rose-200',
		Low: 'bg-amber-50 text-amber-700 ring-amber-200',
		Healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
	}

	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneMap[status]}`}>
			{status}
		</span>
	)
}

function OrderCard({ order, onOpen }) {
	return (
		<button
			type="button"
			onClick={() => onOpen(order)}
			className="w-full rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<div className="flex items-center justify-between">
				<p className="text-sm font-semibold text-[color:var(--text)]">#{String(order.id).slice(0, 8)}</p>
				<span className="text-xs font-semibold text-muted">{order.status}</span>
			</div>
			<p className="mt-2 text-sm text-muted">{order.customer?.name || 'Customer'}</p>
			<p className="mt-3 text-sm font-semibold text-[color:var(--text)]">{formatMoney(order.total)}</p>
		</button>
	)
}

export default function AdminDashboard() {
	const reduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery({})
	const { data: orders = [], isLoading: isOrdersLoading } = useGetAdminOrdersQuery()

	const [search, setSearch] = useState('')
	const [sortKey, setSortKey] = useState('stocks')
	const [sortDir, setSortDir] = useState('asc')
	const [page, setPage] = useState(1)
	const pageSize = 6

	const [activeOrder, setActiveOrder] = useState(null)

	const inventoryRows = useMemo(() => {
		const filtered = products.filter((product) =>
			fuzzyMatch(`${product?.name || ''} ${product?.category || ''}`, search)
		)
		const sorted = [...filtered].sort((a, b) => {
			const dir = sortDir === 'asc' ? 1 : -1
			const valA = a?.[sortKey] ?? 0
			const valB = b?.[sortKey] ?? 0
			if (typeof valA === 'string') return String(valA).localeCompare(String(valB)) * dir
			return (Number(valA) - Number(valB)) * dir
		})
		return sorted
	}, [products, search, sortDir, sortKey])

	const totalPages = Math.max(1, Math.ceil(inventoryRows.length / pageSize))
	const pagedRows = inventoryRows.slice((page - 1) * pageSize, page * pageSize)

	const orderByStatus = useMemo(() => {
		const base = { pending: [], shipped: [], delivered: [] }
		for (const order of orders) {
			if (base[order.status]) base[order.status].push(order)
		}
		return base
	}, [orders])

	return (
		<AdminLayout breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }]}>
			<MotionDiv
				initial={reduceMotion ? false : { opacity: 0, y: 8 }}
				animate={reduceMotion ? false : { opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
			>
				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<StatCard title="Real-time revenue" value="$4.82M" delta={7.4} deltaLabel="WoW" icon={ChartLine} />
					<StatCard title="Net margin" value="38.6%" delta={2.1} deltaLabel="MoM" icon={Layers} />
					<StatCard title="Global orders" value="128,442" delta={-1.7} deltaLabel="WoW" icon={ClipboardList} />
					<StatCard title="Active customers" value="92,418" delta={4.9} deltaLabel="MoM" icon={Users} />
				</section>

				<section className="mt-6 grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<SalesAnalyticsGraph data={SALES_DATA} />
					</div>
					<div className="surface-card p-4 sm:p-5">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-widest text-muted">Global distribution</p>
								<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Order heatmap</h3>
							</div>
							<div className="rounded-full bg-[color:var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
								Live
							</div>
						</div>
						<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
							{GEO_CELLS.map((cell) => (
								<div key={cell.region} className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] p-3 sm:p-4">
									<p className="text-xs font-semibold text-muted">{cell.region}</p>
									<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[color:var(--ring)]">
										<div
											style={{ width: `${cell.value}%` }}
											className="h-full rounded-full bg-[color:var(--primary)]"
										/>
									</div>
									<p className="mt-2 text-sm font-semibold text-[color:var(--text)]">{cell.value}%</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="mt-6 grid gap-6 lg:grid-cols-3">
					<div className="surface-card lg:col-span-2">
						<div className="border-b border-[color:var(--ring)] px-5 py-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-widest text-muted">Inventory command</p>
									<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Smart inventory management</h3>
								</div>
								<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
									<div className="flex w-full items-center gap-2 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 sm:w-auto">
										<PackageSearch className="h-4 w-4 text-muted" aria-hidden="true" />
										<input
											value={search}
											onChange={(event) => {
												setSearch(event.target.value)
												setPage(1)
											}}
											placeholder="Search SKU, name, category"
											className="w-full bg-transparent text-sm text-[color:var(--text)] outline-none sm:w-44"
										/>
									</div>
									<details className="relative w-full sm:w-auto">
										<summary className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-sm text-muted sm:w-auto">
											<Filter className="h-4 w-4" aria-hidden="true" />
											Bulk actions
										</summary>
										<div className="absolute left-0 right-0 top-12 z-10 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] p-2 text-sm shadow-lg sm:left-auto sm:right-0 sm:w-48">
											<button type="button" className="w-full rounded-xl px-3 py-2 text-left hover:bg-[color:var(--surface-strong)]">
												Export CSV
											</button>
											<button type="button" className="w-full rounded-xl px-3 py-2 text-left hover:bg-[color:var(--surface-strong)]">
												Export PDF
											</button>
											<button type="button" className="w-full rounded-xl px-3 py-2 text-left hover:bg-[color:var(--surface-strong)]">
												Batch price update
											</button>
										</div>
									</details>
								</div>
							</div>
						</div>

							<div className="p-4 sm:p-5">
							{isProductsLoading ? (
								<div className="grid gap-3">
									{Array.from({ length: 5 }).map((_, index) => (
										<div key={index} className="h-12 rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] animate-shimmer" />
									))}
								</div>
							) : (
									<div className="space-y-3 sm:space-y-0">
										<div className="sm:hidden">
											<div className="grid gap-3">
												{pagedRows.map((product) => {
													const stock = Number(product?.stocks) || 0
													const status = stock <= 5 ? 'Critical' : stock <= 20 ? 'Low' : 'Healthy'
													return (
														<div key={product.id} className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface)] p-4">
															<div className="flex items-start justify-between gap-3">
																<div>
																	<p className="text-sm font-semibold text-[color:var(--text)]">{product?.name || 'Product'}</p>
																	<p className="text-xs text-muted">SKU {product?.id || 'N/A'}</p>
																</div>
																<InventoryBadge status={status} />
															</div>
															<div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
																<p>Category: {product?.category || 'General'}</p>
																<p>Stock: {formatNumber(stock)}</p>
																<p className="col-span-2 text-sm font-semibold text-[color:var(--text)]">
																	{formatMoney(product?.price)}
																</p>
															</div>
														</div>
													)
												})}
											</div>
										</div>
										<div className="hidden overflow-hidden rounded-2xl border border-[color:var(--ring)] sm:block">
											<div className="overflow-x-auto">
												<table className="min-w-full text-sm">
													<thead className="bg-[color:var(--surface-strong)] text-left text-xs font-semibold uppercase tracking-widest text-muted">
														<tr>
															<th className="px-4 py-3">Product</th>
															<th className="px-4 py-3">Category</th>
															<th className="px-4 py-3">
																<button
																	type="button"
																	onClick={() => {
																		setSortKey('stocks')
																		setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
																	}}
																className="inline-flex items-center gap-1"
															>
																Stock
																<ArrowUpRight className="h-3 w-3" aria-hidden="true" />
															</button>
															</th>
															<th className="px-4 py-3">Status</th>
															<th className="px-4 py-3">Price</th>
														</tr>
													</thead>
													<tbody>
														{pagedRows.map((product) => {
															const stock = Number(product?.stocks) || 0
															const status = stock <= 5 ? 'Critical' : stock <= 20 ? 'Low' : 'Healthy'
															return (
																<tr key={product.id} className="border-t border-[color:var(--ring)]">
																	<td className="px-4 py-3">
																		<p className="font-semibold text-[color:var(--text)]">{product?.name || 'Product'}</p>
																		<p className="text-xs text-muted">SKU {product?.id || 'N/A'}</p>
																	</td>
																	<td className="px-4 py-3 text-muted">{product?.category || 'General'}</td>
																	<td className="px-4 py-3 font-semibold text-[color:var(--text)]">{formatNumber(stock)}</td>
																	<td className="px-4 py-3">
																		<InventoryBadge status={status} />
																	</td>
																	<td className="px-4 py-3 font-semibold text-[color:var(--text)]">{formatMoney(product?.price)}</td>
																</tr>
															)
														})}
													</tbody>
												</table>
											</div>
										</div>
									</div>
							)}

							<div className="mt-4 flex items-center justify-between text-sm text-muted">
								<p>
									Page {page} of {totalPages}
								</p>
								<div className="flex items-center gap-2">
									<button
										type="button"
										disabled={page === 1}
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										className="rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-1 disabled:opacity-60"
									>
										Prev
									</button>
									<button
										type="button"
										disabled={page === totalPages}
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										className="rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-1 disabled:opacity-60"
									>
										Next
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="surface-card p-4 sm:p-5">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted">Customer intelligence</p>
						<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Segments & LTV</h3>
						<div className="mt-5 space-y-3">
							{CUSTOMER_SEGMENTS.map((segment) => (
								<div key={segment.label} className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] p-4">
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold text-[color:var(--text)]">{segment.label}</p>
										<span className="text-xs font-semibold text-muted">{segment.trend}</span>
									</div>
									<p className="mt-2 text-2xl font-semibold text-[color:var(--text)]">{formatNumber(segment.value)}</p>
									<p className="mt-1 text-sm text-muted">Avg LTV {segment.ltv}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="mt-6 grid gap-6 lg:grid-cols-3">
					<div className="surface-card lg:col-span-2">
						<div className="border-b border-[color:var(--ring)] px-5 py-4">
							<p className="text-xs font-semibold uppercase tracking-widest text-muted">Fulfillment workflow</p>
							<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Order lifecycle</h3>
							<p className="mt-1 text-sm text-muted">Track orders from intake to delivery with quick drill-down.</p>
						</div>
						<div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
							{['pending', 'shipped', 'delivered'].map((status) => (
								<div key={status} className="flex flex-col gap-3">
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold text-[color:var(--text)]">{status}</p>
										<span className="text-xs font-semibold text-muted">{orderByStatus[status]?.length || 0}</span>
									</div>
									<div className="space-y-3">
										{isOrdersLoading ? (
											<div className="h-20 rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] animate-shimmer" />
										) : (
											(orderByStatus[status] || []).slice(0, 3).map((order) => (
												<OrderCard key={order.id} order={order} onOpen={setActiveOrder} />
											))
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="surface-card p-4 sm:p-5">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted">Operations score</p>
						<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Ops readiness</h3>
						<div className="mt-5 space-y-4">
							<div className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] p-4">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold text-[color:var(--text)]">Automation coverage</p>
									<span className="text-sm font-semibold text-[color:var(--primary)]">82%</span>
								</div>
								<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[color:var(--ring)]">
									<div className="h-full w-[82%] rounded-full bg-[color:var(--primary)]" />
								</div>
							</div>
							<div className="rounded-2xl border border-[color:var(--ring)] bg-[color:var(--surface-strong)] p-4">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold text-[color:var(--text)]">On-time delivery</p>
									<span className="text-sm font-semibold text-emerald-600">94.2%</span>
								</div>
								<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[color:var(--ring)]">
									<div className="h-full w-[94%] rounded-full bg-emerald-500" />
								</div>
							</div>
							<div className="flex items-center gap-2 text-sm text-muted">
								<BadgeCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
								Predicted SLA compliance looks strong this week.
							</div>
						</div>
					</div>
				</section>
			</MotionDiv>

			{activeOrder ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
					<div className="surface-card w-full max-w-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-widest text-muted">Order detail</p>
								<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">#{activeOrder.id}</h3>
							</div>
							<button
								type="button"
								onClick={() => setActiveOrder(null)}
								className="rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-sm text-muted"
							>
								Close
							</button>
						</div>
						<div className="mt-4 space-y-2 text-sm text-muted">
							<p>
								<span className="font-semibold text-[color:var(--text)]">Customer:</span> {activeOrder.customer?.name || '—'}
							</p>
							<p>
								<span className="font-semibold text-[color:var(--text)]">Tracking:</span> TRK-{String(activeOrder.id).slice(0, 6)}
							</p>
							<p>
								<span className="font-semibold text-[color:var(--text)]">Spend:</span> {formatMoney(activeOrder.total)}
							</p>
							<p>
								<span className="font-semibold text-[color:var(--text)]">History:</span> 6 previous orders · 2 returns
							</p>
						</div>
						<div className="mt-6 flex items-center gap-2">
							<a
								href={`/admin/orders/${activeOrder.id}`}
								className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white"
							>
								View full order
							</a>
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-4 py-2 text-sm text-muted"
							>
								Send update
							</button>
						</div>
					</div>
				</div>
			) : null}
		</AdminLayout>
	)
}
