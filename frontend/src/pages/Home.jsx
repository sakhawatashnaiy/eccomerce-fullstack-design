/**
 * Home / landing page.
 * Renders promo hero, featured sections, and recently-viewed items from localStorage.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { products } from '../data/products.js'
import { getRecentlyViewedIds } from '../utils/recentlyViewed.js'

function parseDate(value) {
	const d = new Date(value)
	return Number.isNaN(d.getTime()) ? null : d
}

function formatTimeLeft(ms) {
	if (ms <= 0) return '00:00:00'
	const totalSeconds = Math.floor(ms / 1000)
	const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
	const seconds = String(totalSeconds % 60).padStart(2, '0')
	return `${hours}:${minutes}:${seconds}`
}

function getDiscounted(allProducts) {
	return allProducts.filter((p) => typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price)
}

function getLatest(allProducts) {
	return [...allProducts]
		.sort((a, b) => {
			const da = parseDate(a.createdAt)?.getTime() ?? 0
			const db = parseDate(b.createdAt)?.getTime() ?? 0
			return db - da
		})
}

function getFeatured(allProducts) {
	return allProducts.filter((p) => p.isFeatured)
}

function buildCategoryCards(allProducts) {
	const map = new Map()
	for (const p of allProducts) {
		map.set(p.category, (map.get(p.category) ?? 0) + 1)
	}
	return Array.from(map.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 4)
		.map(([name, count]) => ({ name, count }))
}

const promoSlides = [
	{
		tag: 'Limited time',
		heading: 'Latest Trending Electronics Items',
		subtitle: 'Make a faster upgrade with curated picks, clean specs, and honest pricing.',
		cta1: { label: 'Shop now', to: '/products' },
		cta2: { label: 'Browse categories', to: '#categories' },
		image: products[0]?.image,
	},
	{
		tag: 'New arrivals',
		heading: 'New drops every week',
		subtitle: 'Fresh gadgets and essentials sorted by newest first — designed to convert.',
		cta1: { label: 'See new arrivals', to: '#latest' },
		cta2: { label: 'View all products', to: '/products' },
		image: products[5]?.image,
	},
	{
		tag: 'Save more',
		heading: 'Discounts that create urgency',
		subtitle: 'Grab selected deals before the countdown ends — limited stock.',
		cta1: { label: 'View discounts', to: '#discounts' },
		cta2: { label: 'Go to products', to: '/products' },
		image: products[1]?.image,
	},
]

export default function Home() {
	const [slideIndex, setSlideIndex] = useState(0)
	const [recentIds, setRecentIds] = useState(() => getRecentlyViewedIds())

	const featured = useMemo(() => getFeatured(products).slice(0, 8), [])
	const latest = useMemo(() => getLatest(products).slice(0, 8), [])
	const discounted = useMemo(() => getDiscounted(products).slice(0, 8), [])
	const categories = useMemo(() => buildCategoryCards(products), [])

	const recentlyViewed = useMemo(() => {
		const byId = new Map(products.map((p) => [p.id, p]))
		return recentIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 8)
	}, [recentIds])

	const discountEnd = useMemo(() => new Date('2026-03-01T00:00:00.000Z').getTime(), [])
	const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(discountEnd - Date.now()))

	useEffect(() => {
		const id = window.setInterval(() => {
			setSlideIndex((i) => (i + 1) % promoSlides.length)
		}, 2000)
		return () => window.clearInterval(id)
	}, [])

	useEffect(() => {
		const id = window.setInterval(() => {
			setTimeLeft(formatTimeLeft(discountEnd - Date.now()))
		}, 1000)
		return () => window.clearInterval(id)
	}, [discountEnd])

	useEffect(() => {
		const refresh = () => setRecentIds(getRecentlyViewedIds())
		window.addEventListener('recentlyViewed:updated', refresh)
		window.addEventListener('storage', refresh)
		return () => {
			window.removeEventListener('recentlyViewed:updated', refresh)
			window.removeEventListener('storage', refresh)
		}
	}, [])

	const slide = promoSlides[slideIndex]

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />
			<main>
				{/* Hero / promotional banner (first impression + conversion) */}
				<section className="relative overflow-hidden bg-slate-950">
					<div className="absolute inset-0 opacity-70">
						<div className="absolute -top-24 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 blur-3xl" />
						<div className="absolute -bottom-24 left-1/4 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-400 blur-3xl" />
					</div>

					<div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:px-8 lg:py-20">
						<div className="lg:col-span-6">
							<p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/15">
								<span className="h-2 w-2 rounded-full bg-emerald-400" />
								{slide.tag}
							</p>
							<h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
								{slide.heading}
							</h1>
							<p className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-200 sm:text-lg">
								{slide.subtitle}
							</p>

							<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
								{slide.cta1.to.startsWith('#') ? (
									<a
										href={slide.cta1.to}
										className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 ring-1 ring-white/20 transition-colors hover:bg-slate-100"
									>
										{slide.cta1.label}
									</a>
								) : (
									<Link
										to={slide.cta1.to}
										className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 ring-1 ring-white/20 transition-colors hover:bg-slate-100"
									>
										{slide.cta1.label}
									</Link>
								)}

								{slide.cta2.to.startsWith('#') ? (
									<a
										href={slide.cta2.to}
										className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
									>
										{slide.cta2.label}
									</a>
								) : (
									<Link
										to={slide.cta2.to}
										className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
									>
										{slide.cta2.label}
									</Link>
								)}
							</div>

							<div className="mt-8 flex items-center gap-2">
								{promoSlides.map((_, i) => (
									<button
										key={i}
										type="button"
										onClick={() => setSlideIndex(i)}
										className={
											i === slideIndex
											? 'h-2.5 w-8 rounded-full bg-white/80'
											: 'h-2.5 w-2.5 rounded-full bg-white/25 hover:bg-white/40'
										}
										aria-label={`Go to slide ${i + 1}`}
									/>
								))}
							</div>
						</div>

						<div className="lg:col-span-6">
							<div className="relative overflow-hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-6">
								<div className="absolute inset-5 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
								{slide.image ? (
									<img
										src={slide.image}
										alt="Promotion"
										className="relative aspect-[4/3] w-full rounded-xl object-fit ring-1 ring-white/10"
										loading="lazy"
									/>
								) : (
									<div className="relative aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10" />
								)}
								<div className="relative mt-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
									<p className="text-sm font-semibold text-white">Trusted checkout • Fast shipping</p>
									<span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
										Secure
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Featured categories */}
				<section id="categories" className="bg-white">
					<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Featured categories</h2>
								<p className="mt-2 text-sm text-slate-600">Jump into what shoppers browse most.</p>
							</div>
							<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
								Browse all
							</Link>
						</div>

						<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{categories.map((c) => (
								<Link
									key={c.name}
									to={`/products?category=${encodeURIComponent(c.name)}`}
									className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-base font-semibold text-slate-900">{c.name}</p>
											<p className="mt-1 text-sm text-slate-600">{c.count} items</p>
										</div>
										<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200 transition-colors group-hover:bg-slate-100">
											<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700" aria-hidden="true">
												<path
													d="M6 7h15l-1.5 8.5a2 2 0 01-2 1.5H9a2 2 0 01-2-1.6L5 4H2"
													stroke="currentColor"
													strokeWidth="1.8"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</span>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>

				{/* Featured products (admin selected) */}
				<section id="featured" className="bg-slate-50">
					<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Featured products</h2>
								<p className="mt-2 text-sm text-slate-600">Admin-selected products to boost conversions.</p>
							</div>
							<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
								View all
							</Link>
						</div>

						<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{featured.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				</section>

				{/* Latest / new arrivals (createdAt DESC) */}
				<section id="latest" className="bg-white">
					<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Latest products</h2>
								<p className="mt-2 text-sm text-slate-600">New arrivals sorted by created date (DESC).</p>
							</div>
							<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
								Shop all
							</Link>
						</div>

						<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{latest.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				</section>

				{/* Discounts (urgency) */}
				<section id="discounts" className="bg-slate-50">
					<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Discounts</h2>
								<p className="mt-2 text-sm text-slate-600">Urgency section with countdown + discount badges.</p>
							</div>
							<div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
								<p className="text-xs font-semibold text-slate-600">Offer ends in</p>
								<p className="mt-1 font-mono text-lg font-semibold text-slate-900">{timeLeft}</p>
							</div>
						</div>

						<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{discounted.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				</section>

				{/* Brands / partners */}
				<section className="bg-white">
					<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
						<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Brands & partners</h2>
						<p className="mt-2 text-sm text-slate-600">Trusted names that help customers buy with confidence.</p>

						<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
							{['Nova', 'Aurex', 'Pulse', 'ByteBook', 'Glow', 'CoreWear'].map((name) => (
								<div
									key={name}
									className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-700"
								>
									{name}
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Testimonials */}
				<section className="bg-slate-50">
					<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Testimonials</h2>
							<p className="mt-2 text-sm text-slate-600">Social proof that supports conversion.</p>
						</div>

						<div className="mt-8 grid gap-4 lg:grid-cols-3">
							{[
								{
									name: 'Ayesha',
									text: 'Fast delivery and the product quality was exactly as described. Checkout felt safe and smooth.',
								},
								{
									name: 'Rohan',
									text: 'Love the clean UI. I found what I needed quickly and the deals section made it easy to decide.',
								},
								{
									name: 'Sara',
									text: 'Great support and simple returns. This store feels professional and trustworthy.',
								},
							].map((t) => (
								<div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6">
									<p className="text-sm text-slate-700">“{t.text}”</p>
									<p className="mt-4 text-sm font-semibold text-slate-900">{t.name}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Recently viewed */}
				{recentlyViewed.length ? (
					<section className="bg-white">
						<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Recently viewed</h2>
									<p className="mt-2 text-sm text-slate-600">Continue where you left off.</p>
								</div>
								<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
									Explore more
								</Link>
							</div>

							<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{recentlyViewed.map((product) => (
									<ProductCard key={product.id} product={product} />
								))}
							</div>
						</div>
					</section>
				) : null}
			</main>
			<Footer />
		</div>
	)
}

