/**
 * Contact page.
 * UI-only contact form, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
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

function validateStep(form, step) {
	const base = validate(form)
	if (step === 0) return {}
	if (step === 1) return { name: base.name, email: base.email }
	if (step === 2) return { message: base.message }
	return base
}

function TypewriterLine({ text }) {
	const [visible, setVisible] = useState('')

	useEffect(() => {
		let index = 0
		const id = window.setInterval(() => {
			index += 1
			setVisible(text.slice(0, index))
			if (index >= text.length) window.clearInterval(id)
		}, 14)
		return () => window.clearInterval(id)
	}, [text])

	return (
		<p className="text-sm leading-6 text-slate-600" aria-live="polite">
			{visible}
		</p>
	)
}

export default function Contact() {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div

	const [form, setForm] = useState({ name: '', email: '', topic: 'Order help', message: '' })
	const [touched, setTouched] = useState({})
	const [isSent, setIsSent] = useState(false)
	const [step, setStep] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const errors = useMemo(() => validate(form), [form])
	const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors])
	const stepErrors = useMemo(() => validateStep(form, step), [form, step])

	const onChange = (key) => (e) => {
		setIsSent(false)
		setForm((prev) => ({ ...prev, [key]: e.target.value }))
	}
	const onBlur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }))

	const submit = (e) => {
		e.preventDefault()
		setTouched({ name: true, email: true, message: true, topic: true })
		if (Object.keys(validate(form)).length > 0) return
		setIsSubmitting(true)
		// UI-only demo: replace with real backend submission.
		window.setTimeout(() => {
			setIsSubmitting(false)
			setIsSent(true)
			window.setTimeout(() => setIsSent(false), 3500)
			setForm({ name: '', email: '', topic: 'Order help', message: '' })
			setTouched({})
			setStep(0)
		}, 650)
	}

	const stepMeta = useMemo(
		() => [
			{
				kicker: 'Direct access',
				title: 'Contact us',
				prompt: 'Route this request. Pick a topic and we’ll hand it to the right team.',
			},
			{
				kicker: 'Identity',
				title: 'Confirm a reply path',
				prompt: 'Contact us.',
			},
			{
				kicker: 'Message',
				title: 'Write the request',
				prompt: 'Describe the issue or intent. We optimize for clarity over volume.',
			},
		],
		[]
	)

	const next = () => {
		if (step === 0) {
			setStep(1)
			return
		}
		if (step === 1) {
			setTouched((prev) => ({ ...prev, name: true, email: true }))
			const nextErrors = validateStep(form, 1)
			if (nextErrors.name || nextErrors.email) return
			setStep(2)
			return
		}
	}

	const back = () => setStep((s) => Math.max(0, s - 1))

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
						<div className="lg:col-span-12">
							<div className="rounded-2xl border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl sm:p-8">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<p className="text-xs font-semibold text-slate-600">{stepMeta[step].kicker}</p>
											<h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{stepMeta[step].title}</h1>
									</div>
									<p className="text-sm text-slate-600">Step {step + 1} / 3</p>
								</div>
								<div className="mt-3">
									{shouldReduceMotion ? (
										<p className="text-sm leading-6 text-slate-600">{stepMeta[step].prompt}</p>
									) : (
										<TypewriterLine key={stepMeta[step].prompt} text={stepMeta[step].prompt} />
									)}
									 
								</div>

								{isSent ? (
									<div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200">
										Request initiated. Human-in-the-loop response within 180 minutes.
									</div>
								) : null}

								<form className="mt-6 grid gap-4" onSubmit={submit}>
									{step === 0 ? (
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
											</select>										</div>
									) : null}

									{step === 1 ? (
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
													placeholder="Name"
													className={fieldClass('name')}
												/>
												{touched.name && stepErrors.name ? (
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
													placeholder="Email"
													className={fieldClass('email')}
												/>
												{touched.email && stepErrors.email ? (
													<p className="mt-1 text-sm text-rose-600">{errors.email}</p>
												) : null}
											</div>
										</div>
									) : null}

									{step === 2 ? (
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
												placeholder="Write the request. Include order # if relevant."
												className={fieldClass('message')}
											/>
											{touched.message && stepErrors.message ? (
												<p className="mt-1 text-sm text-rose-600">{errors.message}</p>
											) : null}
 										</div>
									) : null}

									<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
										<div className="flex flex-wrap items-center gap-3">
											<button
												type="button"
												onClick={back}
												disabled={step === 0 || isSubmitting}
												className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
											>
												Back
											</button>

											{step < 2 ? (
												<button
													type="button"
													onClick={next}
													disabled={isSubmitting}
													className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
												>
													Next
												</button>
											) : (
												<button
													type="submit"
													onClick={() => setTouched((prev) => ({ ...prev, message: true }))}
													disabled={!canSubmit || isSubmitting}
													className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
												>
													{isSubmitting ? 'Submitting…' : 'Send'}
												</button>
											)}
										</div>
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
