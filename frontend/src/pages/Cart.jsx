/**
 * Cart page.
 * Uses `utils/cart.js` for localStorage persistence and renders an order summary.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { clearCart, getCartItems, removeFromCart, setCartItemQty } from '../utils/cart.js'

function formatMoney(value) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(value)
	} catch {
		return `$${value}`
	}
}

function clampQty(value) {
	const n = Math.floor(Number(value) || 0)
	return Math.max(0, Math.min(99, n))
}

export default function Cart() {
	const shouldReduceMotion = useReducedMotion()
	const MotionP = motion.p
	const [items, setItems] = useState(() => getCartItems())
	const [removing, setRemoving] = useState(() => new Set())
	const [poppingId, setPoppingId] = useState(null)
	const timeoutsRef = useRef([])

	useEffect(() => {
		const refresh = () => setItems(getCartItems())
		refresh()
		window.addEventListener('cart:updated', refresh)
		window.addEventListener('storage', refresh)
		return () => {
			window.removeEventListener('cart:updated', refresh)
			window.removeEventListener('storage', refresh)
		}
	}, [])

	useEffect(() => {
		return () => {
			for (const id of timeoutsRef.current) window.clearTimeout(id)
			timeoutsRef.current = []
		}
	}, [])

	const subtotal = useMemo(() => {
		return items.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.qty) || 0), 0)
	}, [items])

	const itemCount = useMemo(() => {
		return items.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0)
	}, [items])

	const shipping = useMemo(() => (subtotal >= 250 ? 0 : items.length ? 15 : 0), [subtotal, items.length])
	const tax = useMemo(() => Math.round(subtotal * 0.08), [subtotal])
	const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax])

	const setQty = (id, nextQty) => {
		const qty = clampQty(nextQty)
		setCartItemQty(id, qty)
		setPoppingId(id)
		const t = window.setTimeout(() => setPoppingId(null), 240)
		timeoutsRef.current.push(t)
	}

	const removeItemAnimated = (id) => {
		setRemoving((prev) => {
			const next = new Set(prev)
			next.add(id)
			return next
		})
		const t = window.setTimeout(() => {
			removeFromCart(id)
			setRemoving((prev) => {
				const next = new Set(prev)
				next.delete(id)
				return next
			})
		}, 180)
		timeoutsRef.current.push(t)
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold text-slate-600">Shopping cart</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Your cart
								<span className="ml-2 align-middle text-sm font-semibold text-slate-600">
									({itemCount} item{itemCount === 1 ? '' : 's'})
								</span>
							</h1>
							<p className="mt-2 text-sm text-slate-600">
								Review your items and adjust quantities before checkout.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/products"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
							>
								← Continue shopping
							</Link>
							<button
								type="button"
								disabled={!items.length}
								onClick={() => clearCart()}
								className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
							>
								Clear cart
							</button>
						</div>
					</div>

					{!items.length ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
							<div className="grid gap-0 lg:grid-cols-2">
								<div className="p-7 sm:p-10">
									<div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
										<svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-slate-700" aria-hidden="true">
											<path
												d="M6 7h15l-1.5 8.5a2 2 0 01-2 1.5H9a2 2 0 01-2-1.6L5 4H2"
												stroke="currentColor"
												strokeWidth="1.8"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
									<h2 className="mt-4 text-xl font-semibold text-slate-900">Your cart is empty</h2>
									<p className="mt-2 text-sm text-slate-600">
										Looks like you haven’t added anything yet. Browse products and come back here anytime.
									</p>
									<div className="mt-6 flex flex-col gap-3 sm:flex-row">
										<Link
											to="/products"
											className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
										>
											Browse products
										</Link>
										<Link
											to="/"
											className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
										>
											Go to home
										</Link>
									</div>
								</div>

								<div className="relative hidden overflow-hidden bg-slate-950 lg:block">
									<div className="absolute inset-0 opacity-75">
										<div className="absolute -top-24 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 blur-3xl" />
										<div className="absolute -bottom-24 left-1/4 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-400 blur-3xl" />
									</div>
									<div className="relative p-10">
										<p className="text-sm font-semibold text-white">Tip</p>
										<h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Free shipping over {formatMoney(250)}</h3>
										<p className="mt-3 text-sm text-slate-200">
											Add a few more items and your shipping can be free.
										</p>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="mt-8 grid gap-6 lg:grid-cols-12">
							<section className="lg:col-span-8">
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-5 py-4 sm:px-6">
										<p className="text-sm font-semibold text-slate-900">Items</p>
									</div>

									<ul className="divide-y divide-slate-200">
										{items.map((item) => {
											const id = item?.id
											const qty = Number(item?.qty) || 0
											const price = Number(item?.price) || 0
											const lineTotal = price * qty
											const isRemoving = removing.has(id)

											return (
												<li
													key={id}
													className={
														'group px-5 py-5 transition-all duration-200 sm:px-6 ' +
														(isRemoving ? 'pointer-events-none opacity-0 -translate-y-1' : 'opacity-100 translate-y-0')
												}
												>
													<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
														<div className="flex items-start gap-4">
															<div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
																{item?.image ? (
																	<img src={item.image} alt={item?.name ?? 'Product'} className="h-full w-full object-cover" />
																) : (
																	<div className="h-full w-full bg-gradient-to-br from-slate-100 to-white" />
																)}
															</div>

															<div className={
																'min-w-0'
															}>
																<MotionP
																	className="truncate text-sm font-semibold text-slate-900"
																	animate={
																		shouldReduceMotion
																			? { opacity: 1 }
																			: poppingId === id
																				? { scale: [1, 1.03, 1] }
																				: { scale: 1 }
																	}
																	transition={{ duration: 0.18, ease: 'easeOut' }}
																>
																	{item?.name ?? 'Item'}
																</MotionP>
																<p className="mt-1 text-sm text-slate-600">{formatMoney(price)} each</p>
																<button
																	type="button"
																	onClick={() => removeItemAnimated(id)}
																	className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
																>
																	<svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
																		<path
																			d="M6 7h12M9 7v14m6-14v14M10 7l1-2h2l1 2"
																		stroke="currentColor"
																		strokeWidth="1.8"
																		strokeLinecap="round"
																		strokeLinejoin="round"
																	/>
																	</svg>
																	Remove
																</button>
															</div>
														</div>

														<div className="flex flex-1 flex-col gap-3 sm:items-end">
															<div className="flex items-center justify-between gap-3 sm:justify-end">
																<div className="inline-flex items-center rounded-xl bg-slate-50 p-1 ring-1 ring-slate-200">
																	<button
																		type="button"
																		onClick={() => setQty(id, qty - 1)}
																		className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-white"
																		aria-label="Decrease quantity"
																	>
																		<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
																			<path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
																		</svg>
																	</button>
																	<input
																		type="number"
																		min={0}
																		max={99}
																		value={qty}
																		onChange={(e) => setQty(id, e.target.value)}
																		className="h-9 w-14 rounded-lg bg-transparent text-center text-sm font-semibold text-slate-900 outline-none"
																		aria-label="Quantity"
																	/>
																	<button
																		type="button"
																		onClick={() => setQty(id, qty + 1)}
																		className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-white"
																		aria-label="Increase quantity"
																	>
																		<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
																			<path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
																		</svg>
																	</button>
																</div>
																<p className="text-sm font-semibold text-slate-900">{formatMoney(lineTotal)}</p>
															</div>

															<p className="text-xs text-slate-500">
																Subtotal updates instantly • Saved to this browser
															</p>
														</div>
													</div>
												</li>
											)
										})}
									</ul>
								</div>
							</section>

							<aside className="lg:col-span-4">
								<div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-5 py-4 sm:px-6">
										<p className="text-sm font-semibold text-slate-900">Order summary</p>
									</div>
									<div className="px-5 py-5 sm:px-6">
										<div className="space-y-3 text-sm">
											<div className="flex items-center justify-between">
												<span className="text-slate-600">Subtotal</span>
												<span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-slate-600">Shipping</span>
												<span className="font-semibold text-slate-900">
													{shipping === 0 ? 'Free' : formatMoney(shipping)}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-slate-600">Estimated tax</span>
												<span className="font-semibold text-slate-900">{formatMoney(tax)}</span>
											</div>
										</div>

										<div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
											<span className="text-sm font-semibold text-slate-900">Total</span>
											<span className="text-lg font-semibold text-slate-900">{formatMoney(total)}</span>
										</div>

										<Link
											to="/checkout"
											className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
											aria-label="Proceed to checkout"
										>
											Proceed to checkout
										</Link>

										<p className="mt-3 text-xs text-slate-500">
											This is a demo checkout button (no payment wired).
										</p>

										<div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
											<p className="text-sm font-semibold text-slate-900">Shipping perk</p>
											<p className="mt-1 text-sm text-slate-600">
												{shipping === 0
													? 'You unlocked free shipping.'
													: `Add ${formatMoney(Math.max(0, 250 - subtotal))} more to get free shipping.`}
											</p>
										</div>
									</div>
								</div>
							</aside>
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	)
}
