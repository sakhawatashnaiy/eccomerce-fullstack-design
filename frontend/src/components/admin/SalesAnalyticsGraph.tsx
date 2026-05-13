/**
 * Sales analytics multi-line area chart.
 */

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

function formatCurrency(value) {
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

function CustomTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null
	return (
		<div className="rounded-xl border border-[color:var(--ring)] bg-[color:var(--surface)] px-3 py-2 text-xs shadow-lg">
			<p className="font-semibold text-[color:var(--text)]">{label}</p>
			{payload.map((item) => (
				<p key={item.dataKey} className="text-muted">
					<span className="font-semibold" style={{ color: item.color }}>
						{item.name}:
					</span>{' '}
					{formatCurrency(item.value)}
				</p>
			))}
		</div>
	)
}

export default function SalesAnalyticsGraph({ data }) {
	return (
		<div className="surface-card h-full p-4 sm:p-5">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-widest text-muted">Sales velocity</p>
					<h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Revenue vs marketing spend</h3>
				</div>
				<div className="rounded-full bg-[color:var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
					Last 12 weeks
				</div>
			</div>
			<div className="mt-6 h-64 sm:h-72">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
								<stop offset="100%" stopColor="var(--primary)" stopOpacity={0.04} />
							</linearGradient>
							<linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
								<stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.35)" />
						<XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
						<YAxis
							tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
							axisLine={false}
							tickFormatter={formatCurrency}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
						<Area
							type="monotone"
							dataKey="sales"
							name="Sales Velocity"
							stroke="var(--primary)"
							fill="url(#salesGradient)"
							strokeWidth={2.5}
						/>
						<Area
							type="monotone"
							dataKey="spend"
							name="Marketing Spend"
							stroke="var(--accent)"
							fill="url(#spendGradient)"
							strokeWidth={2.5}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
