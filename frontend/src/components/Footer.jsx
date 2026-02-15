/**
 * Site footer.
 * Renders simple link columns and a newsletter form (UI-only).
 */
const links = [
	{
		title: 'Shop',
		items: ['New arrivals', 'Best sellers', 'Accessories', 'Gift cards'],
	},
	{
		title: 'Company',
		items: ['About', 'Careers', 'Sustainability', 'Press'],
	},
	{
		title: 'Support',
		items: ['Contact', 'Shipping', 'Returns', 'FAQ'],
	},
]

export default function Footer() {
	return (
		<footer className="border-t border-slate-200 bg-white">
			<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
				<div className="grid gap-10 lg:grid-cols-12">
					<div className="lg:col-span-4">
						<div className="flex items-center gap-2">
							 
							<span className="text-sm font-semibold tracking-tight text-slate-950">My store</span>
						</div>
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
						Welcome to My Store, your everyday destination for quality tech and lifestyle essentials. We curate reliable products, clear specs, and honest prices so you can shop with confidence. From phones and accessories to home upgrades, each item is selected for performance, design, and value. Enjoy a smooth browsing experience, secure checkout, and responsive support whenever you need help. Orders ship fast, returns are simple, and new arrivals land regularly. Whether you’re upgrading your setup or finding a practical gift, we make it easy to choose well. Join our community for tips, deals, and inspiration, and enjoy shopping that feels effortless.
					</p>
						<p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} My store. All rights reserved.</p>
					</div>

					<div className="lg:col-span-8">
						<div className="grid gap-8 sm:grid-cols-3">
							{links.map((group) => (
								<div key={group.title}>
									<p className="text-sm font-semibold text-slate-900">{group.title}</p>
									<ul className="mt-3 space-y-2">
										{group.items.map((item) => (
											<li key={item}>
												<a href="#" className="text-sm text-slate-600 hover:text-slate-900">
													{item}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						<div className="mt-10 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="text-sm font-semibold text-slate-900">Stay in the loop</p>
									<p className="mt-1 text-sm text-slate-600">Product updates, launches, and offers.</p>
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
											className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
										/>
										<button
											type="submit"
											className="h-11 shrink-0 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-900"
										>
											Join
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

