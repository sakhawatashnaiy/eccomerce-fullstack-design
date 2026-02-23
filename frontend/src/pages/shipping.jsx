/**
 * Shipping policy page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const blocks = [
	{
		title: 'Processing time',
		body: 'Most orders are processed within 1–2 business days. During peak periods, processing may take a bit longer.',
	},
	{
		title: 'Delivery estimates',
		body: 'Delivery times depend on location and carrier. Typical delivery is 2–7 business days after dispatch.',
	},
	{
		title: 'Tracking',
		body: 'When your order ships, we provide tracking details so you can follow your package in real time.',
	},
	{
		title: 'International shipping',
		body: 'International availability varies. Import duties/taxes may apply and are the customer’s responsibility when applicable.',
	},
]

export default function Shipping() {
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
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<MotionDiv {...fadeUp(0)} className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-10">
						<p className="text-xs font-semibold text-slate-600">Support</p>
						<h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Shipping</h1>
						<p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
							Clear shipping expectations, tracking, and delivery guidance.
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-2">
							<Link
								to="/contact"
								className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
							>
								Contact support
							</Link>
							<Link
								to="/returns"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
							>
								Returns policy
							</Link>
						</div>
					</MotionDiv>

					<MotionSection {...fadeUp(0.08)} className="mt-8 grid gap-4 sm:grid-cols-2">
						{blocks.map((b) => (
							<MotionDiv
								key={b.title}
								whileHover={shouldReduceMotion ? undefined : { y: -2 }}
								transition={{ type: 'spring', stiffness: 320, damping: 22 }}
								className="rounded-2xl border border-slate-200 bg-white p-6"
							>
								<p className="text-base font-semibold text-slate-950">{b.title}</p>
								<p className="mt-2 text-sm leading-6 text-slate-600">{b.body}</p>
							</MotionDiv>
						))}
					</MotionSection>

					<MotionDiv {...fadeUp(0.14)} className="mt-8 rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-semibold">Tips for a smooth delivery</p>
								<ul className="mt-2 space-y-1 text-sm text-white/75">
									<li>Double-check your address and phone number at checkout.</li>
									<li>Watch tracking for courier updates and delivery attempts.</li>
									<li>Contact support if tracking stops updating for 72 hours.</li>
								</ul>
							</div>
							<Link
								to="/faq"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
							>
								Read FAQ
							</Link>
						</div>
					</MotionDiv>
				</div>
			</main>

			<Footer />
		</div>
	)
}
