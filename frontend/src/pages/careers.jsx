/**
 * Careers page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const roles = [
	{
		title: 'Frontend Engineer (React)',
		location: 'Remote · Full-time',
		team: 'Engineering',
		description: 'Build fast, accessible storefront and admin experiences using React, Tailwind, and modern tooling.',
	},
	{
		title: 'Product Designer',
		location: 'Hybrid · Dhaka',
		team: 'Design',
		description: 'Design intuitive shopping flows and polished UI systems across web and mobile breakpoints.',
	},
	{
		title: 'Customer Support Specialist',
		location: 'On-site · Dhaka',
		team: 'Support',
		description: 'Help customers with orders, shipping, and returns with empathy and speed.',
	},
]

const values = [
	{ title: 'Customer-first', body: 'We optimize for trust: clear specs, honest prices, and reliable support.' },
	{ title: 'Move with care', body: 'We ship quickly, but never at the expense of quality.' },
	{ title: 'Own outcomes', body: 'We measure what matters and take responsibility for results.' },
	{ title: 'Build together', body: 'We collaborate across teams with respect and direct communication.' },
]

export default function Careers() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const MotionUl = motion.ul
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
				<div className="relative overflow-hidden bg-slate-950">
					<div className="pointer-events-none absolute inset-0 opacity-70">
						<div className="absolute -top-28 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 blur-3xl" />
						<div className="absolute -bottom-28 left-1/4 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-400 blur-3xl" />
					</div>

					<div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<MotionDiv {...fadeUp(0)}>
							<p className="text-sm font-semibold text-white/80">Company</p>
							<h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
								Careers at My Store
							</h1>
							<p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/75 sm:text-lg">
								Join a small team building a smooth, reliable shopping experience—powered by modern web tech and a focus on customer trust.
							</p>
							<div className="mt-7 flex flex-wrap items-center gap-3">
								<Link
									to="/contact"
									className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
								>
									Contact recruiting
								</Link>
								<Link
									to="/"
									className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
								>
									Back to home
								</Link>
							</div>
						</MotionDiv>
					</div>
				</div>

				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="grid gap-6 lg:grid-cols-12">
						<MotionDiv className="lg:col-span-7" {...fadeUp(0.05)}>
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<p className="text-xs font-semibold text-slate-600">Open roles</p>
										<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Build with us</h2>
									</div>
									<p className="text-sm text-slate-600">No perfect match? Send a note anyway.</p>
								</div>

								<MotionUl className="mt-6 space-y-3" {...fadeUp(0.1)}>
									{roles.map((role) => (
										<MotionLi
											key={role.title}
											whileHover={shouldReduceMotion ? undefined : { y: -2 }}
											transition={{ type: 'spring', stiffness: 320, damping: 22 }}
											className="rounded-xl border border-slate-200 bg-slate-50 p-5"
										>
											<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="text-base font-semibold text-slate-950">{role.title}</p>
													<p className="mt-1 text-sm text-slate-600">{role.description}</p>
												</div>
												<div className="shrink-0 text-sm text-slate-600">
													<p className="font-medium text-slate-700">{role.team}</p>
													<p className="mt-0.5">{role.location}</p>
												</div>
											</div>
											<div className="mt-4 flex flex-wrap items-center gap-2">
												<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
													Great for juniors
												</span>
												<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
													Fast-paced
												</span>
												<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
													High ownership
												</span>
											</div>
											<div className="mt-5">
												<Link
													to="/contact"
													className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
												>
													Apply
												</Link>
											</div>
										</MotionLi>
									))}
								</MotionUl>
							</div>
						</MotionDiv>

						<MotionDiv className="lg:col-span-5" {...fadeUp(0.12)}>
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">How we work</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Values</h2>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									Simple principles that keep our product—and our team—healthy.
								</p>

								<div className="mt-6 space-y-4">
									{values.map((v) => (
										<div key={v.title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
											<p className="text-sm font-semibold text-slate-900">{v.title}</p>
											<p className="mt-1 text-sm text-slate-600">{v.body}</p>
										</div>
									))}
								</div>

								<div className="mt-7 rounded-xl bg-slate-950 p-5 text-white">
									<p className="text-sm font-semibold">Ready to apply?</p>
									<p className="mt-1 text-sm text-white/75">Send your CV and a short note about what you want to build.</p>
									<div className="mt-4 flex flex-wrap gap-2">
										<a
											href="mailto:careers@example.com"
											className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
										>
											send email
										</a>
										<Link
											to="/faq"
											className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
										>
											Read FAQ
										</Link>
									</div>
								</div>
							</div>
						</MotionDiv>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}
