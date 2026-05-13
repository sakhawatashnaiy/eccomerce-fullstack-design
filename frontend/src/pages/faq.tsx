/**
 * FAQ page.
 * UI-only accordion, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const items = [
	{
		q: 'How do I track my order?',
		a: 'After your order ships, you’ll see tracking in your order details. If tracking hasn’t updated for 72 hours, contact support.',
	},
	{
		q: 'What is your return window?',
		a: 'Most items can be returned within 7–14 days of delivery depending on the product category. Items must be in sellable condition unless defective.',
	},
	{
		q: 'Do you offer cash on delivery?',
		a: 'Availability depends on region and carrier. If supported, you’ll see it during checkout as a payment option.',
	},
	{
		q: 'Can I change my delivery address?',
		a: 'If the order hasn’t shipped, we may be able to update the address. Please contact support as soon as possible with your order number.',
	},
	{
		q: 'What if my item arrives damaged?',
		a: 'Contact support within 48 hours of delivery with photos of the package and item. We’ll help with a replacement or refund.',
	},
]

export default function FAQ() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const MotionSection = motion.section

	const [openIndex, setOpenIndex] = useState(0)
	const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [])

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
					<MotionDiv {...fadeUp(0)} className="rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
						<p className="text-xs font-semibold text-white/80">Support</p>
						<h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">FAQ</h1>
						<p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-white/75 sm:text-lg">
							Quick answers about orders, shipping, and returns.
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-2">
							<Link
								to="/contact"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
							>
								Contact support
							</Link>
							<Link
								to="/shipping"
								className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
							>
								Shipping
							</Link>
							<Link
								to="/returns"
								className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
							>
								Returns
							</Link>
						</div>
					</MotionDiv>

					<MotionSection {...fadeUp(0.08)} className="mt-8 grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-7">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">Questions</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Common answers</h2>

								<div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200">
									{safeItems.map((it, idx) => {
										const isOpen = openIndex === idx
										return (
											<div key={it.q} className="bg-white">
												<button
													type="button"
													onClick={() => setOpenIndex((v) => (v === idx ? -1 : idx))}
													className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-slate-50 sm:px-5"
												>
													<span className="text-sm font-semibold text-slate-950 sm:text-base">{it.q}</span>
													<span
														className={[
															'inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-slate-200',
															isOpen ? 'bg-slate-950 text-white' : 'bg-white text-slate-700',
														].join(' ')}
													>
														{isOpen ? '−' : '+'}
													</span>
												</button>

												<MotionDiv
													initial={false}
													animate={
														shouldReduceMotion
															? { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }
															: { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }
													}
													transition={{ duration: 0.25, ease: 'easeOut' }}
													className="overflow-hidden"
												>
													<div className="px-4 pb-5 text-sm leading-6 text-slate-600 sm:px-5">
														{it.a}
													</div>
												</MotionDiv>
											</div>
										)
									})}
								</div>
							</div>
						</div>

						<div className="lg:col-span-5">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">Shortcuts</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Popular pages</h2>
								<div className="mt-6 space-y-3">
									<Link
										to="/shipping"
										className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100"
									>
										Shipping
										<span className="text-slate-600">→</span>
									</Link>
									<Link
										to="/returns"
										className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100"
									>
										Returns
										<span className="text-slate-600">→</span>
									</Link>
									<Link
										to="/contact"
										className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-4 text-sm font-semibold text-white hover:bg-slate-900"
									>
										Contact
										<span className="text-white/75">→</span>
									</Link>
								</div>

								<div className="mt-7 rounded-xl bg-slate-950 p-5 text-white">
									<p className="text-sm font-semibold">Still stuck?</p>
									<p className="mt-1 text-sm text-white/75">Send your order number and we’ll help quickly.</p>
									<div className="mt-4">
										<a
											href="mailto:support@example.com"
											className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
										>
											support@example.com
										</a>
									</div>
								</div>
							</div>
						</div>
					</MotionSection>
				</div>
			</main>

			<Footer />
		</div>
	)
}
