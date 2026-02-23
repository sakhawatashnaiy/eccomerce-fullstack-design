/**
 * Contact page.
 * UI-only contact form, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function validate(form) {
	const errors = {}
	if (!String(form.name || '').trim()) errors.name = 'Name is required.'
	const email = String(form.email || '').trim()
	if (!email) errors.email = 'Email is required.'
	else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.'
	if (!String(form.message || '').trim()) errors.message = 'Message is required.'
	return errors
}

export default function Contact() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div

	const [form, setForm] = useState({ name: '', email: '', topic: 'Order help', message: '' })
	const [touched, setTouched] = useState({})
	const [isSent, setIsSent] = useState(false)

	const errors = useMemo(() => validate(form), [form])
	const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors])

	const onChange = (key) => (e) => {
		setIsSent(false)
		setForm((prev) => ({ ...prev, [key]: e.target.value }))
	}
	const onBlur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }))

	const submit = (e) => {
		e.preventDefault()
		setTouched({ name: true, email: true, message: true, topic: true })
		if (Object.keys(validate(form)).length > 0) return
		setIsSent(true)
		window.setTimeout(() => setIsSent(false), 3500)
		setForm({ name: '', email: '', topic: 'Order help', message: '' })
		setTouched({})
	}

	const fadeUp = (delay = 0) => {
		return {
			initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
			animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
			transition: { duration: 0.45, ease: 'easeOut', delay },
		}
	}

	const fieldClass = (key) => {
		const hasError = touched[key] && Boolean(errors[key])
		return [
			'w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 transition',
			'placeholder:text-slate-400 focus:outline-none',
			hasError ? 'ring-rose-200 focus:ring-rose-300' : 'ring-slate-200 focus:ring-indigo-300',
		].join(' ')
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<MotionDiv {...fadeUp(0)} className="grid gap-6 lg:grid-cols-12">
						<div className="lg:col-span-5">
							<div className="rounded-3xl bg-slate-950 p-7 text-white sm:p-9">
								<p className="text-xs font-semibold text-white/80">Support</p>
								<h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Contact</h1>
								<p className="mt-3 text-pretty text-base leading-7 text-white/75 sm:text-lg">
									Tell us what you need—orders, shipping, returns, or product questions.
								</p>

								<div className="mt-7 space-y-3 text-sm">
									<p>
										<span className="font-semibold text-white">Email:</span> support@example.com
									</p>
									<p>
										<span className="font-semibold text-white">Hours:</span> Sun–Thu, 10am–6pm
									</p>
									<p>
										<span className="font-semibold text-white">Response time:</span> usually within 24 hours
									</p>
								</div>

								<div className="mt-7 flex flex-wrap gap-2">
									<Link
										to="/shipping"
										className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
									>
										Shipping
									</Link>
									<Link
										to="/returns"
										className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
									>
										Returns
									</Link>
									<Link
										to="/faq"
										className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
									>
										FAQ
									</Link>
								</div>
							</div>
						</div>

						<div className="lg:col-span-7">
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<p className="text-xs font-semibold text-slate-600">Message</p>
										<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Send us a note</h2>
									</div>
									<p className="text-sm text-slate-600">UI-only form (no backend submission)</p>
								</div>

								{isSent ? (
									<div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200">
										Thanks! We received your message.
									</div>
								) : null}

								<form className="mt-6 grid gap-4" onSubmit={submit}>
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="text-sm font-semibold text-slate-900" htmlFor="contact-name">
												Name
											</label>
											<input
												id="contact-name"
												type="text"
												value={form.name}
												onChange={onChange('name')}
												onBlur={onBlur('name')}
												placeholder="Your name"
												className={fieldClass('name')}
											/>
											{touched.name && errors.name ? (
												<p className="mt-1 text-sm text-rose-600">{errors.name}</p>
											) : null}
										</div>
										<div>
											<label className="text-sm font-semibold text-slate-900" htmlFor="contact-email">
												Email
											</label>
											<input
												id="contact-email"
												type="email"
												value={form.email}
												onChange={onChange('email')}
												onBlur={onBlur('email')}
												placeholder="you@example.com"
												className={fieldClass('email')}
											/>
											{touched.email && errors.email ? (
												<p className="mt-1 text-sm text-rose-600">{errors.email}</p>
											) : null}
										</div>
									</div>

									<div>
										<label className="text-sm font-semibold text-slate-900" htmlFor="contact-topic">
											Topic
										</label>
										<select
											id="contact-topic"
											value={form.topic}
											onChange={onChange('topic')}
											className="mt-1 h-11 w-full rounded-xl bg-white px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-indigo-300"
										>
											<option>Order help</option>
											<option>Shipping question</option>
											<option>Returns</option>
											<option>Product question</option>
											<option>Partnership</option>
										</select>
									</div>

									<div>
										<label className="text-sm font-semibold text-slate-900" htmlFor="contact-message">
											Message
										</label>
										<textarea
											id="contact-message"
											rows={6}
											value={form.message}
											onChange={onChange('message')}
											onBlur={onBlur('message')}
											placeholder="How can we help?"
											className={fieldClass('message')}
										/>
										{touched.message && errors.message ? (
											<p className="mt-1 text-sm text-rose-600">{errors.message}</p>
										) : null}
									</div>

									<div className="flex flex-wrap items-center gap-3">
										<button
											type="submit"
											disabled={!canSubmit}
											className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Send message
										</button>
										<p className="text-sm text-slate-600">
											Prefer email?{' '}
											<a className="font-semibold text-slate-900 hover:underline" href="mailto:support@example.com">
												support@example.com
											</a>
										</p>
									</div>
								</form>
							</div>
						</div>
					</MotionDiv>
				</div>
			</main>

			<Footer />
		</div>
	)
}
