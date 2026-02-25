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
		<footer className="border-t border-slate-200 bg-white">
			<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
				<div className="grid gap-10 lg:grid-cols-12">
					<div className="lg:col-span-12">
						<div className="mx-auto grid max-w-4xl justify-items-center gap-8 sm:grid-cols-3">
							{links.map((group) => (
								<div key={group.title} className="text-center">
									<p className="text-base font-semibold text-slate-900">{group.title}</p>
									<ul className="mt-3 flex flex-col items-center space-y-2">
										{group.items.map((item) => (
											<li key={item.label}>
												<Link to={item.to} className="text-base text-slate-600 hover:text-slate-900">
													{item.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						<div className="mt-10 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
							<div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-center">
								<div className="sm:text-left">
									<p className="text-base font-semibold text-slate-900">Stay in the loop</p>
									<p className="mt-1 text-base text-slate-600">Product updates, launches, and offers.</p>
								</div>
								<form className="w-full sm:max-w-sm" onSubmit={(e) => e.preventDefault()}>
									<div className="flex gap-2">
										<label className="sr-only" htmlFor="footer-email">
											Email
										</label>
										<input
											id="footer-email"
											type="email"
											placeholder="Email"
											className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
										/>
										<button
											type="submit"
											className="h-11 shrink-0 rounded-lg bg-slate-950 px-4 text-base font-semibold text-white hover:bg-slate-900"
										>
											Join
										</button>
									</div>
								</form>
							</div>
						</div>
						<p className="mt-10 text-center text-xs text-slate-500">
							© {new Date().getFullYear()} My store. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default memo(Footer)

