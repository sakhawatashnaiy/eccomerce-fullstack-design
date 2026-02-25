/**
 * About page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const statusQuo = [
	'Heavy pages that load slowly, then stutter under interaction.',
	'Checkout flows that feel fragile: lost state, surprise reloads, unclear errors.',
	'Inconsistent UI patterns that break trust: spacing drift, mismatched buttons, shifting layouts.',
]

const breakthroughs = [
	{
		title: 'Next-generation engine',
		body: 'A storefront engineered like a product: predictable performance, consistent UI, and a checkout that stays fast under real traffic.',
	},
	{
		title: 'Technology that disappears',
		body: 'The interface stays fluid so attention stays on the product details, not the page mechanics.',
	},
	{
		title: 'Design-system-led consistency',
		body: 'Reusable primitives, stable spacing, and intentional typography—so every screen feels like the same system.',
	},
]

const history = [
	{
		title: 'Built to reduce friction',
		body: 'This store started as a simple goal: make browsing, comparing, and checking out feel obvious—no surprises, no clutter.',
	},
	{
		title: 'Shaped by real orders',
		body: 'We prioritize clear product information, predictable shipping expectations, and straightforward returns.',
	},
	{
		title: 'Designed as a system',
		body: 'Consistent UI patterns across pages so customers can move faster and trust what they’re seeing.',
	},
]

const availableInStore = [
	{ title: 'Electronics', body: 'Everyday tech with clear specs and compatibility details.' },
	{ title: 'Fashion', body: 'Seasonal essentials with straightforward sizing and materials info.' },
	{ title: 'Home & Living', body: 'Practical home picks—clean descriptions, reliable fulfillment.' },
	{ title: 'Accessories', body: 'The small add-ons that complete a setup without guesswork.' },
]

const customerBenefits = [
	{ title: 'Faster decisions', body: 'Readable product pages that make comparison simple.' },
	{ title: 'Predictable checkout', body: 'A flow that stays consistent from cart to confirmation.' },
	{ title: 'Clear policies', body: 'Shipping and returns written for humans, not fine print.' },
]

const giftAndDeals = [
	{
		title: 'Gift cards',
		body: 'A simple way to share the store. Choose an amount, send it, and let them pick what they actually want.',
		cta: { label: 'View gift cards', to: '/giftcards' },
	},
	{
		title: 'Discounts',
		body: 'Seasonal promos and limited-time price drops are shown clearly on product listings and at checkout—no hidden math.',
		cta: { label: 'Browse products', to: '/products' },
	},
]

export default function About() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const MotionSection = motion.section

	const fadeUp = (delay = 0) => {
		return {
			initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
			animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
			transition: { duration: 0.45, ease: 'easeOut', delay },
		}
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="relative overflow-hidden bg-slate-950">
					<div className="pointer-events-none absolute inset-0 opacity-70">
						<div className="absolute -top-28 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 blur-3xl" />
						<div className="absolute -bottom-28 left-1/4 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-400 blur-3xl" />
					</div>

					<div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<MotionDiv {...fadeUp(0)} className="text-center">
							<p className="text-3xl font-bold italic text-white/90 sm:text-4xl">About Us</p>
							 
							<p className="mx-auto mt-4 max-w-3xl text-pretty text-lg leading-8 text-white/85 sm:text-xl">
								Welcome to My Store, your everyday destination for quality tech and lifestyle essentials. We curate reliable products, clear specs, and honest prices so you can shop with confidence. From phones and accessories to home upgrades, each item is selected for performance, design, and value. Enjoy a smooth browsing experience, secure checkout, and responsive support whenever you need help. Orders ship fast, returns are simple, and new arrivals land regularly. Whether you’re upgrading your setup or finding a practical gift, we make it easy to choose well. Join our community for tips, deals, and inspiration, and enjoy shopping that feels effortless.
							</p>
							<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
								<Link
									to="/products"
									className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
								>
									Browse products
								</Link>
								<Link
									to="/contact"
									className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
								>
									Contact
								</Link>
							</div>
						</MotionDiv>
					</div>
				</div>

				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<MotionSection {...fadeUp(0.06)} className="grid gap-4 sm:grid-cols-3">
						{breakthroughs.map((h) => (
							<MotionDiv
								key={h.title}
								whileHover={shouldReduceMotion ? undefined : { y: -2 }}
								transition={{ type: 'spring', stiffness: 320, damping: 22 }}
								className="rounded-2xl border border-slate-200 bg-white p-6"
							>
								<p className="text-lg font-semibold text-slate-950">{h.title}</p>
								<p className="mt-2 text-base leading-7 text-slate-700">{h.body}</p>
							</MotionDiv>
						))}
					</MotionSection>

					<MotionSection {...fadeUp(0.12)} className="mt-8 grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-6">
							<div className="h-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">The status quo</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Bloated storefronts, expensive latency</h2>
								<p className="mt-3 text-base leading-7 text-slate-700">
									E-commerce used to accept slow as normal. That trade-off shows up as abandoned carts, mistrust, and interfaces that feel heavier than the products they sell.
								</p>
								<ul className="mt-5 space-y-2 text-base leading-7 text-slate-700">
									{statusQuo.map((item) => (
										<li key={item} className="flex gap-3">
											<span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-slate-300" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className="lg:col-span-6">
							<div className="h-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">The breakthrough</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">A next-generation engine</h2>
								<p className="mt-3 text-base leading-7 text-slate-700">
									We designed the system around a simple constraint: every interaction should feel immediate, consistent, and composable—across devices, networks, and catalogs.
								</p>
								<div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
									<p className="text-sm font-semibold text-slate-900">Philosophy</p>
									<p className="mt-1 text-base leading-7 text-slate-700">
										We didn’t just build a shop. We engineered a high-performance shopping interface where rendering, styling, and data flow are treated as product surface area.
									</p>
								</div>
							</div>
						</div>
					</MotionSection>

					<MotionSection {...fadeUp(0.18)} className="mt-8">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="text-xs font-semibold text-slate-600">Our history</p>
									<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Built for everyday shopping</h2>
								</div>
								<p className="text-sm leading-6 text-slate-700 sm:max-w-md">
									A simple promise: remove friction, keep expectations clear, and make every step feel intentional.
								</p>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-3">
								{history.map((h) => (
									<div key={h.title} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
										<p className="text-lg font-semibold text-slate-950">{h.title}</p>
										<p className="mt-2 text-base leading-7 text-slate-700">{h.body}</p>
									</div>
								))}
							</div>
						</div>
					</MotionSection>

					<MotionSection {...fadeUp(0.24)} className="mt-8">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
							<p className="text-xs font-semibold text-slate-600">Our mission</p>
							<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">The bridge between code and commerce</h2>
							<p className="mt-3 text-base leading-7 text-slate-700">
								Build a storefront that behaves like a system: fast by default, consistent by construction, and ready for the next wave of full-stack UX.
							</p>
							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{availableInStore.map((item) => (
									<div key={item.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
										<p className="text-base font-semibold text-slate-900">{item.title}</p>
										<p className="mt-1 text-base leading-7 text-slate-700">{item.body}</p>
									</div>
								))}
							</div>
							<div className="mt-6 grid gap-4 sm:grid-cols-3">
								<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
									<p className="text-base font-semibold text-slate-900">Latency</p>
									<p className="mt-1 text-base leading-7 text-slate-700">Every click, route, and submit is treated as a performance budget.</p>
								</div>
								<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
									<p className="text-base font-semibold text-slate-900">Consistency</p>
									<p className="mt-1 text-base leading-7 text-slate-700">A design system that holds: typography, spacing, and component behavior.</p>
								</div>
								<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
									<p className="text-base font-semibold text-slate-900">Future-proofing</p>
									<p className="mt-1 text-base leading-7 text-slate-700">Built for full-stack rendering patterns without sacrificing UX clarity.</p>
								</div>
							</div>
						</div>
					</MotionSection>

					<MotionSection {...fadeUp(0.27)} className="mt-8">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="text-xs font-semibold text-slate-600">Extras</p>
									<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Gift cards & discounts</h2>
								</div>
								<p className="text-sm leading-6 text-slate-700 sm:max-w-md">Flexible options for gifting and savings.</p>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{giftAndDeals.map((item) => (
									<div key={item.title} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
										<p className="text-lg font-semibold text-slate-950">{item.title}</p>
										<p className="mt-2 text-base leading-7 text-slate-700">{item.body}</p>
										<div className="mt-4">
											<Link
												to={item.cta.to}
												className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
											>
												{item.cta.label}
											</Link>
										</div>
									</div>
								))}
							</div>
						</div>
					</MotionSection>

					<MotionSection {...fadeUp(0.3)} className="mt-8">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="text-xs font-semibold text-slate-600">Benefits</p>
									<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">What you get as a customer</h2>
								</div>
								<p className="text-sm leading-6 text-slate-700 sm:max-w-md">
									Practical advantages you’ll notice immediately.
								</p>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-3">
								{customerBenefits.map((b) => (
									<div key={b.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
										<p className="text-base font-semibold text-slate-900">{b.title}</p>
										<p className="mt-1 text-base leading-7 text-slate-700">{b.body}</p>
									</div>
								))}
							</div>
						</div>
					</MotionSection>
				</div>
			</main>	
			<Footer />
		</div>
	)
}			


 