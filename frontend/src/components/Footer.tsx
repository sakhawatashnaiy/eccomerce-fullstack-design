/**
 * Site footer.
 * Renders simple link columns and a newsletter form (UI-only).
 */
import { memo } from 'react'
import { Link } from 'react-router-dom'

const links = [
	{
		title: 'Shop',
		items: [
			{ label: 'New arrivals', to: '/products' },
			{ label: 'Best sellers', to: '/products' },
			{ label: 'Accessories', to: '/products' },
			{ label: 'Gift cards', to: '/products' },
		],
	},
	{
		title: 'Company',
		items: [
			{ label: 'About', to: '/about' },
			{ label: 'Careers', to: '/careers' },
			{ label: 'Sustainability', to: '/sustainability' },
			{ label: 'Press', to: '/press' },
		],
	},
	{
		title: 'Support',
		items: [
			{ label: 'Contact', to: '/contact' },
			{ label: 'Shipping', to: '/shipping' },
			{ label: 'Returns', to: '/returns' },
			{ label: 'FAQ', to: '/faq' },
		],
	},
]

function Footer() {
	return (
		<footer className="border-t border-slate-900/10 bg-slate-950 text-slate-100">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-10 lg:grid-cols-12">
					<div className="lg:col-span-12">
						<div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-10">
							{links.map((group) => (
								<div key={group.title} className="text-left">
									<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
										{group.title}
									</p>
									<ul className="mt-4 flex flex-col space-y-2">
										{group.items.map((item) => (
											<li key={item.label}>
												<Link
													to={item.to}
													className="text-base text-slate-200 transition hover:text-amber-200"
												>
													{item.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						<div className="mt-10 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950 p-6 ring-1 ring-white/10 sm:p-8">
							<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
								<div className="sm:max-w-xs">
									<p className="text-lg font-semibold text-white">Stay in the loop</p>
									<p className="mt-1 text-sm text-slate-300">Product updates, launches, and offers.</p>
								</div>
								<form className="w-full sm:max-w-sm" onSubmit={(e) => e.preventDefault()}>
									<div className="flex flex-col gap-3 sm:flex-row">
										<label className="sr-only" htmlFor="footer-email">
											Email
										</label>
										<input
											id="footer-email"
											type="email"
											placeholder="Email"
											className="h-11 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 text-base text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/20"
										/>
										<button
											type="submit"
											className="h-11 shrink-0 rounded-lg bg-amber-300 px-4 text-base font-semibold text-slate-950 transition hover:bg-amber-200"
										>
											Join
										</button>
									</div>
								</form>
							</div>
						</div>
						<p className="mt-10 text-center text-xs text-slate-400">
							© {new Date().getFullYear()} My store. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default memo(Footer)

