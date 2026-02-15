/**
 * Product details page.
 * Finds a product by route param `id`, tracks recently viewed, and allows add-to-cart.
 */
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import { products } from '../data/products.js'
import { addToCart } from '../utils/cart.js'
import { addRecentlyViewed } from '../utils/recentlyViewed.js'

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

export default function ProductDetails() {
	const { id } = useParams()
	const product = products.find((p) => p.id === id)

	if (product) {
		addRecentlyViewed(product.id)
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />
			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="mb-6">
						<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
							← Back to products
						</Link>
					</div>

					{!product ? (
						<div className="rounded-2xl border border-slate-200 bg-white p-6">
							<h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
							<p className="mt-2 text-sm text-slate-600">This product may have been removed.</p>
						</div>
					) : (
						<div className="grid gap-8 lg:grid-cols-12">
							<div className="lg:col-span-7">
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="aspect-[4/3] bg-slate-100">
										<img src={product.image} alt={product.name} className="h-full w-full object-cover" />
									</div>
								</div>
							</div>

							<div className="lg:col-span-5">
								<div className="rounded-2xl border border-slate-200 bg-white p-6">
									<p className="text-xs font-semibold text-slate-600">{product.category}</p>
									<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
									<p className="mt-2 text-sm text-slate-600">
										Brand: <span className="font-semibold text-slate-800">{product.brand ?? '—'}</span>
									</p>

									<div className="mt-5 flex items-end justify-between">
										<div>
											<p className="text-2xl font-semibold text-slate-900">{formatMoney(product.price)}</p>
											{product.compareAtPrice ? (
												<p className="text-sm text-slate-500 line-through">{formatMoney(product.compareAtPrice)}</p>
											) : null}
										</div>
										<span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
											{product.rating} ★ ({product.reviews})
										</span>
									</div>

									<button
										type="button"
										className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
										onClick={() => addToCart(product, 1)}
									>
										Add to cart
									</button>

									<div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
										<p className="text-sm font-semibold text-slate-900">Delivery & returns</p>
										<p className="mt-1 text-sm text-slate-600">Fast shipping. Simple 30-day returns.</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
			<Footer />
		</div>
	)
}
