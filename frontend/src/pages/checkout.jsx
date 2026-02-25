/**
 * Checkout page (demo).
 *
 * Goals:
 * - Reuse the existing cart persistence (`utils/cart.js`) so totals match the Cart page.
 * - Keep the UI modern + responsive using the same Tailwind tokens already used elsewhere.
 * - Provide a realistic checkout form, but do NOT implement real payments (demo-only).
 */

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { clearCart, getCartItems } from '../utils/cart.js'
import { isSignedIn } from '../utils/authSession.js'
import { useCreateMyOrderMutation } from '../services/apiSlice.js'

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

export default function Checkout() {
	const navigate = useNavigate()

	// 1) Read cart items from localStorage.
	//    We also subscribe to the `cart:updated` event so this page stays in sync.
	const [items, setItems] = useState(() => getCartItems())
	const [isPlacingOrder, setIsPlacingOrder] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	const [submitError, setSubmitError] = useState('')
	const [createMyOrder] = useCreateMyOrderMutation()

	// 2) Minimal form state (UI-only).
	//    This is intentionally lightweight: no backend calls and no payment processing.
	const [form, setForm] = useState({
		email: '',
		fullName: '',
		address: '',
		city: '',
		state: '',
		zip: '',
	})

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

	// 3) Recompute totals exactly like Cart page.
	const subtotal = useMemo(() => {
		return items.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.qty) || 0), 0)
	}, [items])

	const itemCount = useMemo(() => {
		return items.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0)
	}, [items])

	const shipping = useMemo(() => (subtotal >= 250 ? 0 : items.length ? 15 : 0), [subtotal, items.length])
	const tax = useMemo(() => Math.round(subtotal * 0.08), [subtotal])
	const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax])

	const isEmpty = items.length === 0

	const onChange = (key) => (e) => {
		const value = e.target.value
		setForm((prev) => ({ ...prev, [key]: value }))
	}

	const placeOrder = async (e) => {
		e.preventDefault()
		if (isEmpty) return
		if (!isSignedIn()) {
			setSubmitError('Please sign in to place an order.')
			return
		}

		// 4) Demo checkout behavior:
		//    - Pretend to "place" the order.
		//    - Clear cart so the user sees the effect.
		//    - Show a success state and optionally send them home.
		setIsPlacingOrder(true)
		setSubmitError('')
		try {
			await createMyOrder({
				items,
				subtotal,
				shipping,
				tax,
				total,
				customer: {
					name: form.fullName,
					email: form.email,
					phone: '',
				},
				shippingAddress: {
					line1: form.address,
					line2: '',
					city: form.city,
					state: form.state,
					postalCode: form.zip,
					country: '',
				},
				payment: {
					method: 'cod',
					status: 'unpaid',
				},
			}).unwrap()
			clearCart()
			setOrderPlaced(true)
			window.setTimeout(() => navigate('/'), 1100)
		} catch (err) {
			const message = err?.data?.message || err?.error || 'Could not place order. Please try again.'
			setSubmitError(String(message))
		} finally {
			setIsPlacingOrder(false)
		}
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold text-slate-600">Checkout</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Complete your order
							</h1>
							{/* <p className="mt-2 text-sm text-slate-600">
								This is a demo checkout — no real payment is processed.
							</p> */}
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/cart"
								className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
							>
								← Back to cart
							</Link>
							<Link
								to="/products"
								className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-white"
							>
								Continue shopping
							</Link>
						</div>
					</div>

					{isEmpty ? (
						<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
							<div className="p-7 sm:p-10">
								<h2 className="text-xl font-semibold text-slate-900">Your cart is empty</h2>
								<p className="mt-2 text-sm text-slate-600">
									Add a product first, then come back to checkout.
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
						</div>
					) : (
						<div className="mt-8 grid gap-6 lg:grid-cols-12">
							{/* Left: checkout form */}
							<section className="lg:col-span-8">
								<form onSubmit={placeOrder} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-5 py-4 sm:px-6">
										<p className="text-sm font-semibold text-slate-900">Shipping & contact</p>
									</div>

									<div className="px-5 py-6 sm:px-6">
										{/* Contact section */}
										<div className="grid gap-4 sm:grid-cols-2">
											<div className="sm:col-span-2">
												<label className="text-sm font-semibold text-slate-800" htmlFor="checkout-email">
													Email
												</label>
												<input
													id="checkout-email"
													type="email"
													required
													value={form.email}
													onChange={onChange('email')}
													placeholder="you@example.com"
													className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
												/>
											</div>

											<div className="sm:col-span-2">
												<label className="text-sm font-semibold text-slate-800" htmlFor="checkout-name">
													Full name
												</label>
												<input
													id="checkout-name"
													type="text"
													required
													value={form.fullName}
													onChange={onChange('fullName')}
													placeholder="Full name"
													className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
												/>
											</div>

											<div className="sm:col-span-2">
												<label className="text-sm font-semibold text-slate-800" htmlFor="checkout-address">
													Address
												</label>
												<input
													id="checkout-address"
													type="text"
													required
													value={form.address}
													onChange={onChange('address')}
													placeholder="Street address"
													className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
												/>
											</div>

											<div>
												<label className="text-sm font-semibold text-slate-800" htmlFor="checkout-city">
													City
												</label>
												<input
													id="checkout-city"
													type="text"
													required
													value={form.city}
													onChange={onChange('city')}
													placeholder="City"
													className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
												/>
											</div>

											<div>
												<label className="text-sm font-semibold text-slate-800" htmlFor="checkout-state">
													State
												</label>
												<input
													id="checkout-state"
													type="text"
													required
													value={form.state}
													onChange={onChange('state')}
													placeholder="State"
													className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
												/>
											</div>

											<div className="sm:col-span-2 sm:max-w-xs">
												<label className="text-sm font-semibold text-slate-800" htmlFor="checkout-zip">
													ZIP / Postal
												</label>
												<input
													id="checkout-zip"
													type="text"
													required
													value={form.zip}
													onChange={onChange('zip')}
													placeholder="ZIP"
													className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
												/>
											</div>
										</div>

										{/* Payment placeholder */}
										<div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
											<p className="text-sm font-semibold text-slate-900">Payment</p>
											<p className="mt-1 text-sm text-slate-600">Demo only — add your payment provider later.</p>
											<div className="mt-4 grid gap-3 sm:grid-cols-2">
												<div className="sm:col-span-2">
													<div className="flex h-11 w-full items-center rounded-lg border border-dashed border-slate-300 bg-white px-3 text-sm text-slate-500">
													Card details (placeholder)
												</div>
											</div>
											<div className="flex h-11 w-full items-center rounded-lg border border-dashed border-slate-300 bg-white px-3 text-sm text-slate-500">
												MM/YY
											</div>
											<div className="flex h-11 w-full items-center rounded-lg border border-dashed border-slate-300 bg-white px-3 text-sm text-slate-500">
												CVC
											</div>
										</div>
									</div>

									<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-xs text-slate-500">By placing your order, you agree this is a demo flow.</p>
										<button
											type="submit"
											disabled={isPlacingOrder || orderPlaced}
											className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{orderPlaced ? 'Order placed' : isPlacingOrder ? 'Placing order…' : 'Place order'}
										</button>
									</div>
									{submitError ? (
										<p className="mt-3 text-xs font-semibold text-rose-600">{submitError}</p>
									) : null}
								</div>
							</form>
						</section>

							{/* Right: order summary */}
							<aside className="lg:col-span-4">
								<div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="border-b border-slate-200 px-5 py-4 sm:px-6">
										<p className="text-sm font-semibold text-slate-900">Order summary</p>
										<p className="mt-1 text-xs text-slate-600">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
									</div>

									<div className="px-5 py-5 sm:px-6">
										<ul className="space-y-3">
											{items.map((item) => {
												const qty = Number(item?.qty) || 0
												const price = Number(item?.price) || 0
												return (
													<li key={item?.id} className="flex items-center justify-between gap-3">
														<div className="flex min-w-0 items-center gap-3">
															<div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
																{item?.image ? (
																	<img src={item.image} alt={item?.name ?? 'Product'} className="h-full w-full object-cover" />
																) : (
																	<div className="h-full w-full bg-gradient-to-br from-slate-100 to-white" />
																)}
															</div>
															<div className="min-w-0">
																<p className="truncate text-sm font-semibold text-slate-900">{item?.name ?? 'Item'}</p>
																<p className="mt-0.5 text-xs text-slate-600">Qty {qty}</p>
															</div>
														</div>
														<p className="text-sm font-semibold text-slate-900">{formatMoney(price * qty)}</p>
													</li>
												)
											})}
										</ul>

										<div className="mt-5 space-y-3 text-sm">
											<div className="flex items-center justify-between">
												<span className="text-slate-600">Subtotal</span>
												<span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-slate-600">Shipping</span>
												<span className="font-semibold text-slate-900">{shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
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

