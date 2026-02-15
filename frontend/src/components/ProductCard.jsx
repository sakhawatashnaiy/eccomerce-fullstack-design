/**
 * Product list card component.
 * Handles navigation to details, recently-viewed tracking, and add-to-cart.
 */
import { Link } from 'react-router-dom'
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

function Stars({ rating = 0 }) {
	const fullStars = Math.round(rating)
	return (
		<div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
			{Array.from({ length: 5 }).map((_, i) => {
				const isFilled = i < fullStars
				return (
					<svg
						key={i}
						viewBox="0 0 20 20"
						className={isFilled ? 'h-4 w-4 text-amber-500' : 'h-4 w-4 text-slate-300'}
						aria-hidden="true"
					>
						<path
							d="M10 14.6l-4.1 2.2.8-4.6L3.4 9 8 8.3 10 4l2 4.3 4.6.7-3.3 3.2.8 4.6L10 14.6z"
							fill="currentColor"
						/>
					</svg>
				)
			})}
		</div>
	)
}

export default function ProductCard({ product }) {
	const {
		id,
		name,
		category,
		price,
		compareAtPrice,
		rating,
		reviews,
		badge,
		image,
	} = product

	const hasDiscount = typeof compareAtPrice === 'number' && compareAtPrice > price

	return (
		<article className="group rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300">
			<div className="relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
				<div className="aspect-[4/3] w-full">
					<Link
						to={`/product/${id}`}
						onClick={() => addRecentlyViewed(id)}
						className="block"
						aria-label={`View ${name}`}
					>
						{image ? (
							<img
								src={image}
								alt={name}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							/>
						) : (
							<div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-50" />
						)}
					</Link>
				</div>

				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />

				<div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-start justify-between gap-2">
					<div className="inline-flex max-w-[70%] items-center rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
						{category}
					</div>
					{hasDiscount ? (
						<div className="inline-flex items-center rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
							Sale
						</div>
					) : null}
					{badge ? (
						<div className="inline-flex items-center rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
							{badge}
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold text-slate-900">
							<Link to={`/product/${id}`} onClick={() => addRecentlyViewed(id)} className="hover:underline">
								{name}
							</Link>
						</h3>
						<p className="mt-0.5 text-xs text-slate-600">{category}</p>
					</div>
					<div className="text-right">
						<p className="text-sm font-semibold text-slate-900">{formatMoney(price)}</p>
						{compareAtPrice ? (
							<p className="text-xs text-slate-500 line-through">{formatMoney(compareAtPrice)}</p>
						) : (
							<p className="text-xs text-slate-500">&nbsp;</p>
						)}
					</div>
				</div>

				<div className="mt-2 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Stars rating={rating} />
						<span className="text-xs text-slate-600">({reviews})</span>
					</div>
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
						onClick={() => addToCart(product, 1)}
					>
						Add to cart
					</button>
				</div>
			</div>
		</article>
	)
}

