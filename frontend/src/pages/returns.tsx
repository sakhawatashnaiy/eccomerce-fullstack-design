/**
 * Returns policy page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const steps = [
	{ title: 'Start a return', body: 'Contact support with your order number and the item(s) you want to return.' },
	{ title: 'Pack the item', body: 'Return items in original condition when possible. Include all accessories and manuals.' },
	{ title: 'Ship it back', body: 'We’ll provide instructions. Keep your tracking receipt until the return is processed.' },
	{ title: 'Refund or exchange', body: 'Once inspected, we’ll issue a refund to the original payment method or process an exchange.' },
]

const rules = [
	{ title: 'Return window', body: 'Most items are eligible for return within 7–14 days of delivery (varies by product type).' },
	{ title: 'Eligibility', body: 'Items must be unused or gently used and in sellable condition, unless defective on arrival.' },
	{ title: 'Non-returnable', body: 'Certain items (e.g., clearance or hygiene-sensitive products) may be final sale.' },
	{ title: 'Refund timing', body: 'Refunds typically appear 3–10 business days after approval, depending on the bank.' },
]

export default function Returns() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const MotionOl = motion.ol
	const MotionLi = motion.li

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
						<h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Returns</h1>
						<p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
							Simple, fair returns. If something isn’t right, we’ll help.
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-2">
							<Link
								to="/contact"
								className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
							>
								Start a return
							</Link>
							<Link
								to="/shipping"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
							>
								Shipping
							</Link>
						</div>
					</MotionDiv>

					<MotionDiv {...fadeUp(0.08)} className="mt-8 grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-7">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">How it works</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Return steps</h2>
								<MotionOl className="mt-6 space-y-3" {...fadeUp(0.12)}>
									{steps.map((s, idx) => (
										<MotionLi
											key={s.title}
											whileHover={shouldReduceMotion ? undefined : { y: -2 }}
											transition={{ type: 'spring', stiffness: 320, damping: 22 }}
											className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200"
										>
											<div className="flex items-start gap-3">
												<span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
													{idx + 1}
												</span>
												<div>
													<p className="text-base font-semibold text-slate-950">{s.title}</p>
													<p className="mt-1 text-sm leading-6 text-slate-600">{s.body}</p>
												</div>
											</div>
										</MotionLi>
									))}
								</MotionOl>
							</div>
						</div>

						<div className="lg:col-span-5">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">Policy</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Key rules</h2>
								<div className="mt-6 space-y-3">
									{rules.map((r) => (
										<div key={r.title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
											<p className="text-sm font-semibold text-slate-900">{r.title}</p>
											<p className="mt-1 text-sm text-slate-600">{r.body}</p>
										</div>
									))}
								</div>

								<div className="mt-7 rounded-xl bg-slate-950 p-5 text-white">
									<p className="text-sm font-semibold">Need help deciding?</p>
									<p className="mt-1 text-sm text-white/75">Check common questions about refunds, exchanges, and damaged items.</p>
									<div className="mt-4">
										<Link
											to="/faq"
											className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
										>
											Read FAQ
										</Link>
									</div>
								</div>
							</div>
						</div>
					</MotionDiv>
				</div>
			</main>

			<Footer />
		</div>
	)
}
