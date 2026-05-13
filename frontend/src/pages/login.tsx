/**
 * Login page (UI-first).
 *
 * This app's backend is Firebase-based, but frontend auth wiring isn't present yet.
 * This page provides a modern responsive login UI with basic client-side validation.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getFriendlyAuthError, loginWithEmailPassword } from '../services/authClient.js'

function validate(form) {
	const errors = {}
	const email = String(form.email || '').trim()
	const password = String(form.password || '')

	if (!email) errors.email = 'Email is required.'
	else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.'

	if (!password) errors.password = 'Password is required.'

	return errors
}

export default function Login() {
	const navigate = useNavigate()
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div
	const MotionSection = motion.section
	const [form, setForm] = useState({ email: '', password: '' })
	const [touched, setTouched] = useState({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [success, setSuccess] = useState(false)
	const [serverError, setServerError] = useState('')

	const errors = useMemo(() => validate(form), [form])
	const canSubmit = useMemo(() => Object.keys(errors).length === 0 && !isSubmitting, [errors, isSubmitting])

	const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
	const onBlur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }))

	const submit = async (e) => {
		e.preventDefault()
		setServerError('')
		setTouched({ email: true, password: true })
		if (Object.keys(validate(form)).length > 0) return

		setIsSubmitting(true)
		try {
			await loginWithEmailPassword({ email: form.email, password: form.password })
			setSuccess(true)
			window.setTimeout(() => navigate('/'), 850)
		} catch (error) {
			setServerError(getFriendlyAuthError(error))
		} finally {
			setIsSubmitting(false)
		}
	}

	const fieldClass = (key) => {
		const hasError = touched[key] && Boolean(errors[key])
		return [
			'w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 transition',
			'placeholder:text-slate-400',
			hasError
				? 'ring-rose-200 focus:ring-rose-300'
				: 'ring-slate-200 focus:ring-indigo-300',
			'focus:outline-none',
		].join(' ')
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="relative overflow-hidden bg-slate-950">
				<div className="pointer-events-none absolute inset-0 opacity-70">
					<MotionDiv
						className="absolute -top-28 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 blur-3xl"
						animate={shouldReduceMotion ? undefined : { y: [0, -10, 0], scale: [1, 1.02, 1] }}
						transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<MotionDiv
						className="absolute -bottom-28 left-1/4 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-400 blur-3xl"
						animate={shouldReduceMotion ? undefined : { y: [0, 12, 0], scale: [1, 1.02, 1] }}
						transition={shouldReduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
					/>
				</div>

				<div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
					<h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Sign in to continue
					</h1>
					<p className="mt-3 max-w-xl text-center text-base leading-7 text-slate-200 sm:text-lg">
						Access your orders, saved details, and a faster checkout.
					</p>

					<section className="mt-6 w-full">
						<div className="mx-auto w-full max-w-md">
							<MotionSection
								initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
								animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
								transition={{ duration: 0.35, ease: 'easeOut' }}
								className="overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur"
							>
								<div className="border-b border-slate-200/70 bg-white px-6 py-5 sm:px-8">
									<h2 className="text-xl font-semibold tracking-tight text-slate-900">Sign in</h2>
									<p className="mt-1 text-sm text-slate-600">Use the email you signed up with.</p>
								</div>

								<form onSubmit={submit} className="px-6 py-5 sm:px-8 sm:py-6">
									{success ? (
										<MotionDiv
											className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200"
											initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
											animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
											transition={{ duration: 0.2, ease: 'easeOut' }}
										>
											Signed in. Redirecting…
										</MotionDiv>
									) : null}
									{serverError ? (
										<MotionDiv
											className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200"
											initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
											animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
											transition={{ duration: 0.2, ease: 'easeOut' }}
										>
											{serverError}
										</MotionDiv>
									) : null}

									<div className="grid gap-4">
										<div>
											<label className="mb-1.5 block text-sm font-semibold text-slate-900" htmlFor="email">
												Email
											</label>
											<input
												id="email"
												type="email"
												autoComplete="email"
												value={form.email}
												onChange={onChange('email')}
												onBlur={onBlur('email')}
												className={fieldClass('email')}
												placeholder="you@example.com"
											/>
											{touched.email && errors.email ? (
												<p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p>
											) : null}
										</div>

										<div>
											<label className="mb-1.5 block text-sm font-semibold text-slate-900" htmlFor="password">
												Password
											</label>
											<div className="relative">
												<input
													id="password"
													type={showPassword ? 'text' : 'password'}
													autoComplete="current-password"
													value={form.password}
													onChange={onChange('password')}
													onBlur={onBlur('password')}
													className={fieldClass('password') + ' pr-12'}
													placeholder="••••••••"
												/>
												<button
													type="button"
													onClick={() => setShowPassword((v) => !v)}
													className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
													aria-label={showPassword ? 'Hide password' : 'Show password'}
												>
													{showPassword ? 'Hide' : 'Show'}
												</button>
											</div>
											{touched.password && errors.password ? (
												<p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password}</p>
											) : null}
										</div>
									</div>

									<button
										type="submit"
										disabled={!canSubmit}
										className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isSubmitting ? (
											<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" aria-hidden="true">
												<path
													d="M12 3a9 9 0 019 9"
													stroke="currentColor"
													strokeWidth="1.8"
													strokeLinecap="round"
												/>
											</svg>
										) : null}
										<span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
									</button>

									<p className="mt-6 text-center text-sm text-slate-600">
										No account yet?{' '}
										<Link to="/signup" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
											Create one
										</Link>
									</p>
								</form>
							</MotionSection>
							<p className="mt-4 text-center text-xs text-white/70">
								Just browsing?{' '}
								<Link to="/products" className="font-semibold text-white transition-colors hover:text-white/90">
									Explore products
								</Link>
							</p>
						</div>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	)
}

