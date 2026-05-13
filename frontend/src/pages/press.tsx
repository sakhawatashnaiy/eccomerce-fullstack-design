/**
 * Press page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const releases = [
	{
		date: '2026-01-12',
		title: 'My Store launches faster checkout and streamlined returns',
		body: 'A smoother payment flow, clearer order tracking, and simpler return steps—designed for trust and speed.',
	},
	{
		date: '2025-11-03',
		title: 'New packaging update reduces material usage',
		body: 'Right-sized packaging across top categories helps reduce waste while keeping products protected.',
	},
	{
		date: '2025-08-19',
		title: 'Admin tools updated for better catalog management',
		body: 'Improved product creation and management workflows help keep listings accurate and consistent.',
	},
]

function formatDate(value) {
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) return value
	try {
		return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(d)
	} catch {
		return d.toLocaleDateString()
	}
}

export default function Press() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
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
						<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
							<div>
								<p className="text-xs font-semibold text-slate-600">Company</p>
								<h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
									Press
								</h1>
								<p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
									For media inquiries, brand assets, and announcements.
								</p>
							</div>

							<div className="w-full max-w-md rounded-2xl bg-slate-950 p-6 text-white">
								<p className="text-sm font-semibold">Media contact</p>
								<p className="mt-1 text-sm text-white/75">We typically reply within 1–2 business days.</p>
								<div className="mt-4 space-y-2 text-sm">
									<p>
										<span className="font-semibold text-white">Email:</span> press@example.com
									</p>
									<p>
										<span className="font-semibold text-white">Location:</span> Dhaka
									</p>
								</div>
								<div className="mt-5 flex flex-wrap gap-2">
									<Link
										to="/contact"
										className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
									>
										Contact us
									</Link>
									<Link
										to="/sustainability"
										className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
									>
										Sustainability
									</Link>
								</div>
							</div>
						</div>
					</MotionDiv>

					<MotionDiv {...fadeUp(0.08)} className="mt-8 grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-7">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">Press releases</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Latest updates</h2>
								<ul className="mt-6 space-y-3">
									{releases.map((r) => (
										<MotionLi
											key={r.title}
											whileHover={shouldReduceMotion ? undefined : { y: -2 }}
											transition={{ type: 'spring', stiffness: 320, damping: 22 }}
											className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200"
										>
											<p className="text-xs font-semibold text-slate-600">{formatDate(r.date)}</p>
											<p className="mt-2 text-base font-semibold text-slate-950">{r.title}</p>
											<p className="mt-2 text-sm leading-6 text-slate-600">{r.body}</p>
										</MotionLi>
									))}
								</ul>
							</div>
						</div>

						<div className="lg:col-span-5">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">Brand kit</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Assets & guidelines</h2>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									Use our name as “My Store”. Please avoid altering colors or stretching logos.
								</p>
								<div className="mt-6 space-y-3">
									<div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
										<p className="text-sm font-semibold text-slate-900">Short description</p>
										<p className="mt-1 text-sm text-slate-600">
											My Store is a modern ecommerce experience focused on fast shopping, clear product details, and reliable delivery.
										</p>
									</div>
									<div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
										<p className="text-sm font-semibold text-slate-900">Media requests</p>
										<p className="mt-1 text-sm text-slate-600">
											For interviews, partnerships, or feature stories, email press@example.com.
										</p>
									</div>
								</div>

								<div className="mt-7 flex flex-wrap gap-2">
									<a
										href="mailto:press@example.com"
										className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
									>
										Request assets
									</a>
									<Link
										to="/faq"
										className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
									>
										FAQ
									</Link>
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
