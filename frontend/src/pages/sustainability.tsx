/**
 * Sustainability page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const pillars = [
	{
		title: 'Responsible sourcing',
		body: 'We prioritize suppliers who can document safer materials, fair labor practices, and reliable quality controls.',
	},
	{
		title: 'Smarter packaging',
		body: 'Right-sized boxes, recycled fill, and fewer unnecessary inserts—designed to protect products and reduce waste.',
	},
	{
		title: 'Lower-impact shipping',
		body: 'We work to consolidate shipments and reduce split deliveries where possible, without slowing down customers.',
	},
	{
		title: 'Product longevity',
		body: 'Clear specs, honest guidance, and easy returns help customers choose items that last and get used.',
	},
]

const highlights = [
	{ kpi: 'Right-sized packaging', value: '92%', note: 'Orders shipped with reduced void-fill.' },
	{ kpi: 'Paper-first inserts', value: '100%', note: 'No plastic marketing flyers.' },
	{ kpi: 'Returns re-stocked', value: 'Up to 70%', note: 'Eligible items inspected and reshelved.' },
]

export default function Sustainability() {
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
					<MotionDiv {...fadeUp(0)} className="rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10">
						<p className="text-sm font-semibold text-white/80">Company</p>
						<h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Sustainability</h1>
						<p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/75 sm:text-lg">
							We build better shopping by reducing waste, improving product clarity, and partnering with suppliers who care.
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-3">
							<Link
								to="/shipping"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
							>
								Shipping details
							</Link>
							<Link
								to="/returns"
								className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
							>
								Returns policy
							</Link>
						</div>
					</MotionDiv>

					<MotionSection {...fadeUp(0.06)} className="mt-8 grid gap-4 sm:grid-cols-3">
						{highlights.map((item) => (
							<div key={item.kpi} className="rounded-2xl border border-slate-200 bg-white p-6">
								<p className="text-xs font-semibold text-slate-600">{item.kpi}</p>
								<p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</p>
								<p className="mt-2 text-sm text-slate-600">{item.note}</p>
							</div>
						))}
					</MotionSection>

					<MotionSection {...fadeUp(0.12)} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<p className="text-xs font-semibold text-slate-600">Our approach</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Practical steps, measurable progress</h2>
							</div>
							<p className="text-sm text-slate-600">Updated periodically as processes improve.</p>
						</div>

						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							{pillars.map((p) => (
								<MotionDiv
									key={p.title}
									whileHover={shouldReduceMotion ? undefined : { y: -2 }}
									transition={{ type: 'spring', stiffness: 320, damping: 22 }}
									className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200"
								>
									<p className="text-base font-semibold text-slate-900">{p.title}</p>
									<p className="mt-2 text-sm leading-6 text-slate-600">{p.body}</p>
								</MotionDiv>
							))}
						</div>

						<div className="mt-7 flex flex-wrap items-center gap-3 rounded-xl bg-slate-950 p-5 text-white">
							<div className="min-w-0">
								<p className="text-sm font-semibold">Questions about materials or packaging?</p>
								<p className="mt-1 text-sm text-white/75">We’ll share sourcing info when available.</p>
							</div>
							<Link
								to="/contact"
								className="ml-auto inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
							>
								Contact us
							</Link>
						</div>
					</MotionSection>
				</div>
			</main>

			<Footer />
		</div>
	)
}
