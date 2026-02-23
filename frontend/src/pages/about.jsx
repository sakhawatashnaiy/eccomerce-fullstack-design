/**
 * About page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const highlights = [
	{
		title: 'Curated essentials',
		body: 'We focus on quality tech and lifestyle products with clear specs and honest pricing.',
	},
	{
		title: 'Fast, simple checkout',
		body: 'A smooth flow from cart to confirmation—designed to be quick on any device.',
	},
	{
		title: 'Support that replies',
		body: 'Shipping questions, returns, or product details—reach us and we’ll help.',
	},
]

const values = [
	{ title: 'Trust', body: 'Transparent product information and straightforward policies.' },
	{ title: 'Quality', body: 'Reliable items, tested flows, and thoughtful UI details.' },
	{ title: 'Speed', body: 'Performance-first pages that feel instant.' },
	{ title: 'Care', body: 'We aim for practical sustainability and fair support.' },
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
						<MotionDiv {...fadeUp(0)}>
							<p className="text-sm font-semibold text-white/80">Company</p>
							<h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
								About My Store
							</h1>
							<p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/75 sm:text-lg">
								My Store is built for everyday shopping: clear product details, fast browsing, and a checkout flow that feels effortless.
							</p>
							<div className="mt-7 flex flex-wrap items-center gap-3">
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
						{highlights.map((h) => (
							<MotionDiv
								key={h.title}
								whileHover={shouldReduceMotion ? undefined : { y: -2 }}
								transition={{ type: 'spring', stiffness: 320, damping: 22 }}
								className="rounded-2xl border border-slate-200 bg-white p-6"
							>
								<p className="text-base font-semibold text-slate-950">{h.title}</p>
								<p className="mt-2 text-sm leading-6 text-slate-600">{h.body}</p>
							</MotionDiv>
						))}
					</MotionSection>

					<MotionSection {...fadeUp(0.12)} className="mt-8 grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-12">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">What we do</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">A modern ecommerce experience</h2>
								<p className="mt-3 text-sm leading-6 text-slate-600">
									We aim to make shopping feel simple and premium—great typography, responsive layouts, and interactions that stay fast.
								</p>

								<div className="mt-6 grid gap-4 sm:grid-cols-2">
									{values.map((v) => (
										<div key={v.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
											<p className="text-sm font-semibold text-slate-900">{v.title}</p>
											<p className="mt-1 text-sm text-slate-600">{v.body}</p>
										</div>
									))}
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


 