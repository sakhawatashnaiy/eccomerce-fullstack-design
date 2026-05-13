/**
 * Reusable stat card for dashboard KPIs.
 */

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

function formatDelta(value) {
	const n = Number(value) || 0
	const sign = n > 0 ? '+' : ''
	return `${sign}${n.toFixed(1)}%`
}

export default function StatCard({ title, value, delta = 0, deltaLabel = 'vs last period', icon: Icon }) {
	const isPositive = Number(delta) >= 0
	const deltaTone = isPositive ? 'text-emerald-600' : 'text-rose-600'
	const DeltaIcon = isPositive ? ArrowUpRight : ArrowDownRight

	return (
		<div className="surface-card group relative overflow-hidden p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
			<div className="absolute right-4 top-4 rounded-2xl bg-[color:var(--primary-soft)] p-2 text-[color:var(--primary)]">
				{Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
			</div>
			<p className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</p>
			<div className="mt-3 text-2xl font-semibold text-[color:var(--text)] sm:text-3xl">{value}</div>
			<div className="mt-3 flex items-center gap-2 text-sm">
				<span className={`inline-flex items-center gap-1 font-semibold ${deltaTone}`}>
					<DeltaIcon className="h-4 w-4" aria-hidden="true" />
					{formatDelta(delta)}
				</span>
				<span className="text-muted">{deltaLabel}</span>
			</div>
		</div>
	)
}
