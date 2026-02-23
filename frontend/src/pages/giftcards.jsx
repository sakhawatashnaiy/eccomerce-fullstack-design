/**
 * Gift Cards page.
 * UI-only content, animated + responsive.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { addToCart } from '../utils/cart.js'

const PRESET_AMOUNTS = [10, 25, 50, 100]

function formatMoney(value) {
	const amount = Number(value)
	if (!Number.isFinite(amount)) return ''
	return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export default function GiftCards() {
	const navigate = useNavigate()
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const MotionSection = motion.section
	const MotionButton = motion.button

	const [amountMode, setAmountMode] = useState('preset')
	const [presetAmount, setPresetAmount] = useState(PRESET_AMOUNTS[2])
	const [customAmount, setCustomAmount] = useState('')
	const [toEmail, setToEmail] = useState('')
	const [fromName, setFromName] = useState('')
	const [message, setMessage] = useState('')
	const [submitted, setSubmitted] = useState(false)

	const selectedAmount = useMemo(() => {
		if (amountMode === 'preset') return presetAmount
		const numeric = Number(customAmount)
		return Number.isFinite(numeric) ? numeric : NaN
	}, [amountMode, presetAmount, customAmount])

	const validationErrors = useMemo(() => {
		const next = {}
		const email = String(toEmail || '').trim()
		const name = String(fromName || '').trim()
		const note = String(message || '').trim()

		if (!email) next.toEmail = 'Recipient email is required.'
		else if (!/^\S+@\S+\.\S+$/.test(email)) next.toEmail = 'Enter a valid email address.'

		if (!name) next.fromName = 'Your name is required.'

		if (amountMode === 'custom') {
			if (!String(customAmount || '').trim()) next.customAmount = 'Enter an amount.'
			else if (!Number.isFinite(selectedAmount)) next.customAmount = 'Enter a valid number.'
			else if (selectedAmount < 5) next.customAmount = 'Minimum amount is $5.'
			else if (selectedAmount > 500) next.customAmount = 'Maximum amount is $500.'
		}

		if (note.length > 250) next.message = 'Message must be 250 characters or less.'

		return next
	}, [toEmail, fromName, message, amountMode, customAmount, selectedAmount])

	const errors = useMemo(() => {
		return submitted ? validationErrors : {}
	}, [submitted, validationErrors])

	const canSubmit = useMemo(() => {
		return Object.keys(validationErrors).length === 0
	}, [validationErrors])

	const fadeUp = (delay = 0) => {
		return {
			initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
			animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
			transition: { duration: 0.45, ease: 'easeOut', delay },
		}
	}

	const onSubmit = (event) => {
		event.preventDefault()
		setSubmitted(true)
		if (!canSubmit) return

		const amount = Math.round(Number(selectedAmount) || 0)
		const email = String(toEmail || '').trim()
		const from = String(fromName || '').trim()
		const note = String(message || '').trim()
		const idSafeEmail = email.replace(/[^a-z0-9]+/gi, '-').slice(0, 24) || 'recipient'

		addToCart(
			{
				id: `giftcard-${amount}-${idSafeEmail}`,
				name: `Gift Card (${formatMoney(amount)})`,
				price: amount,
				image: '',
				meta: {
					giftcard: true,
					toEmail: email,
					fromName: from,
					message: note,
				},
			},
			1,
		)

		navigate('/checkout')
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-100">
				<div className="relative overflow-hidden bg-white">
					<div className="pointer-events-none absolute inset-0 opacity-80">
						<div className="absolute -top-28 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-slate-200 via-slate-50 to-slate-300 blur-3xl" />
						<div className="absolute -bottom-28 left-1/4 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-slate-300 via-white to-slate-200 blur-3xl" />
					</div>

					<div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<MotionDiv {...fadeUp(0)}>
							<p className="text-sm font-semibold text-slate-600">Shop</p>
							<h1 className="mt-3 whitespace-nowrap text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
								Gift Cards
							</h1>
							<p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
								A simple way to share your favorite store. Send instantly by email—fast, flexible, and always the right size.
							</p>
							<div className="mt-7 flex flex-wrap items-center gap-3">
								<Link
									to="/products"
									className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
								>
									Browse products
								</Link>
								<Link
									to="/faq"
									className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
								>
									Gift card FAQ
								</Link>
							</div>
						</MotionDiv>
					</div>
				</div>

				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="grid gap-6 lg:grid-cols-12">
						<MotionSection className="lg:col-span-7" {...fadeUp(0.06)}>
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<p className="text-xs font-semibold text-slate-600">Customize</p>
										<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Choose amount</h2>
									</div>
									<p className="text-sm text-slate-600">Delivered by email. Redeemable on any product.</p>
								</div>

								<div className="mt-6 flex flex-wrap gap-2">
									<button
										type="button"
										onClick={() => setAmountMode('preset')}
										className={
											amountMode === 'preset'
												? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white'
												: 'rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200'
										}
									>
										Preset
									</button>
									<button
										type="button"
										onClick={() => setAmountMode('custom')}
										className={
											amountMode === 'custom'
												? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white'
												: 'rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200'
										}
									>
										Custom
									</button>
								</div>

								{amountMode === 'preset' ? (
									<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
										{PRESET_AMOUNTS.map((value) => {
											const active = value === presetAmount
											const helper = value === 50 ? 'Most popular' : 'Fast & easy'
											return (
												<MotionButton
													key={value}
													type="button"
													onClick={() => setPresetAmount(value)}
													whileHover={shouldReduceMotion ? undefined : { y: -2 }}
													transition={{ type: 'spring', stiffness: 320, damping: 22 }}
													className={
														active
															? 'rounded-xl bg-slate-950 px-4 py-4 text-left text-white'
															: 'rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-slate-900 hover:bg-slate-100'
													}
												>
													<p className="text-sm font-semibold">{formatMoney(value)}</p>
													<p className={active ? 'mt-1 text-xs text-white/70' : 'mt-1 text-xs text-slate-600'}>{helper}</p>
												</MotionButton>
											)
										})}
									</div>
								) : (
									<div className="mt-5">
										<label className="text-sm font-semibold text-slate-900">Custom amount</label>
										<div className="mt-2 flex items-center gap-2">
											<span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">$</span>
											<input
												type="number"
												inputMode="decimal"
												min={5}
												max={500}
												value={customAmount}
												onChange={(e) => setCustomAmount(e.target.value)}
												placeholder="25"
												className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
											/>
										</div>
										<p className="mt-2 text-xs text-slate-600">Between $5 and $500.</p>
										{errors.customAmount ? (
											<p className="mt-2 text-xs font-semibold text-rose-600">{errors.customAmount}</p>
										) : null}
									</div>
								)}

								<div className="mt-8">
									<p className="text-xs font-semibold text-slate-600">Preview</p>
									<div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-300 via-white to-slate-200 p-[1px]">
										<div className="relative rounded-2xl bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-6 sm:p-7">
											<div className="pointer-events-none absolute inset-0">
												<div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-white/60 blur-2xl" />
												<div className="absolute -right-14 bottom-6 h-44 w-44 rounded-full bg-white/40 blur-2xl" />
												<div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 opacity-80" />
												<div className="absolute left-6 top-0 h-full w-[1px] bg-white/60" />
											</div>

											<div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="text-xs font-semibold tracking-wide text-slate-600">DIGITAL GIFT CARD</p>
													<p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">A little something for you</p>
													<p className="mt-2 max-w-md text-sm text-slate-600">Redeem at checkout on any item.</p>
												</div>

												<div className="shrink-0 rounded-xl bg-white/70 px-4 py-3 ring-1 ring-white/60">
													<p className="text-xs font-semibold text-slate-600">Value</p>
													<p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
														{Number.isFinite(selectedAmount) ? formatMoney(selectedAmount) : '$—'}
													</p>
												</div>
											</div>

											<div className="relative mt-6 overflow-hidden rounded-xl bg-white/60 p-4 ring-1 ring-white/60">
												<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div className="text-sm text-slate-700">
														<span className="font-semibold text-slate-900">To:</span>{' '}
														{String(toEmail || '').trim() || 'recipient@email.com'}
													</div>
													<div className="text-sm text-slate-700">
														<span className="font-semibold text-slate-900">From:</span>{' '}
														{String(fromName || '').trim() || 'Your name'}
													</div>
												</div>
												<div className="mt-3 border-t border-white/70 pt-3 text-sm text-slate-700">
													<span className="font-semibold text-slate-900">Message:</span>{' '}
													{String(message || '').trim() || 'A short note makes it extra special.'}
												</div>
											</div>

											<div className="relative mt-5 flex items-center justify-between text-xs font-semibold text-slate-600">
												<span>Gifted with care</span>
												<span className="inline-flex items-center gap-2">
													<svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
														<path d="M4 12h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
														<path d="M12 12v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
														<path d="M4 12V9a2 2 0 012-2h12a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
														<path d="M12 7c-2.5 0-4-1.2-4-3a2 2 0 014 0c0 1.8 0 3 0 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
														<path d="M12 7c2.5 0 4-1.2 4-3a2 2 0 00-4 0c0 1.8 0 3 0 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
													</svg>
													<span>Redeem online</span>
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</MotionSection>

						<MotionSection className="lg:col-span-5" {...fadeUp(0.12)}>
							<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
								<p className="text-xs font-semibold text-slate-600">Delivery</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Send by email</h2>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									Fill in the details below. This demo page does not charge or place orders yet.
								</p>

								{submitted && canSubmit ? (
									<div className="mt-6 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
										<p className="text-sm font-semibold text-emerald-900">Looks good.</p>
										<p className="mt-1 text-sm text-emerald-800">Next step would be checkout integration.</p>
									</div>
								) : null}

								<form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
									<div>
										<label className="text-sm font-semibold text-slate-900">Recipient email</label>
										<input
											type="email"
											value={toEmail}
											onChange={(e) => setToEmail(e.target.value)}
											placeholder="friend@email.com"
											className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
										/>
										{errors.toEmail ? (
											<p className="mt-2 text-xs font-semibold text-rose-600">{errors.toEmail}</p>
										) : null}
									</div>

									<div>
										<label className="text-sm font-semibold text-slate-900">Your name</label>
										<input
											type="text"
											value={fromName}
											onChange={(e) => setFromName(e.target.value)}
											placeholder="Alex"
											className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
										/>
										{errors.fromName ? (
											<p className="mt-2 text-xs font-semibold text-rose-600">{errors.fromName}</p>
										) : null}
									</div>

									<div>
										<label className="text-sm font-semibold text-slate-900">Message (optional)</label>
										<textarea
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											rows={4}
											placeholder="Hope you find something you love."
											className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
										/>
										<div className="mt-2 flex items-center justify-between">
											<p className="text-xs text-slate-600">Max 250 characters.</p>
											<p className="text-xs font-semibold text-slate-600">{String(message || '').length}/250</p>
										</div>
										{errors.message ? (
											<p className="mt-2 text-xs font-semibold text-rose-600">{errors.message}</p>
										) : null}
									</div>

									<div className="pt-2">
										<button
											type="submit"
											className="inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
											disabled={!Number.isFinite(selectedAmount)}
										>
											Continue
										</button>
										<p className="mt-3 text-center text-xs text-slate-600">
											Need help?{' '}
											<Link to="/contact" className="font-semibold text-slate-900 hover:underline">
												Contact support
											</Link>
										</p>
									</div>
								</form>

								<div className="mt-8 rounded-xl bg-slate-950 p-5 text-white">
									<p className="text-sm font-semibold">Good to know</p>
									<ul className="mt-3 space-y-2 text-sm text-white/75">
										<li className="flex gap-2">
											<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
											No expiration in this demo content.
										</li>
										<li className="flex gap-2">
											<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
											Redeemable on any item.
										</li>
										<li className="flex gap-2">
											<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
											Delivered instantly by email.
										</li>
									</ul>
								</div>
							</div>
						</MotionSection>
					</div>

					<MotionSection className="mt-10" {...fadeUp(0.18)}>
						<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
							<div className="grid gap-6 lg:grid-cols-3">
								<div>
									<p className="text-xs font-semibold text-slate-600">Why gift cards</p>
									<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Perfect for any occasion</h2>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										Birthdays, thank-yous, last-minute surprises—gift cards keep it simple.
									</p>
								</div>
								<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
									<p className="text-sm font-semibold text-slate-950">Instant delivery</p>
									<p className="mt-1 text-sm text-slate-600">Send it now, schedule later in checkout (future).</p>
								</div>
								<div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
									<p className="text-sm font-semibold text-slate-950">Easy to redeem</p>
									<p className="mt-1 text-sm text-slate-600">Use it on any product—no restrictions.</p>
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
