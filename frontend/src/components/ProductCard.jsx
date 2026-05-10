/**
 * Product list card component.
 * Handles navigation to details and recently-viewed tracking.
 */
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { memo } from 'react'
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

const Stars = memo(function Stars({ rating = 0 }) {
	const fullStars = Math.round(rating)
	return (
		<div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
			{Array.from({ length: 5 }).map((_, i) => {
				const isFilled = i < fullStars
				return (
					<svg
						key={i}
						viewBox="0 0 20 20"
						className={
							isFilled
								? 'h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4'
								: 'h-3.5 w-3.5 text-slate-300 sm:h-4 sm:w-4'
						}
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
})

function ProductCard({ product }) {
	const MotionArticle = motion.article
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
		<MotionArticle
			className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:border-slate-300 hover:shadow-md sm:p-4"
			whileHover={{ y: -3 }}
			transition={{ duration: 0.18, ease: 'easeOut' }}
		>
			<div className="relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
				<div className="aspect-square w-full">
					<Link
						to={`/product/${id}`}
						onClick={() => addRecentlyViewed(id)}
						className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
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

				<div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-2 sm:left-3 sm:right-3 sm:top-3">
					<div className="inline-flex max-w-[70%] items-center rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
						{category}
					</div>
					{hasDiscount || badge ? (
						<div className="flex flex-col items-end gap-1">
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
					) : null}
				</div>
			</div>

			<div className="mt-3 flex flex-1 flex-col sm:mt-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="text-xs font-semibold leading-5 text-slate-900 sm:text-sm">
							<Link to={`/product/${id}`} onClick={() => addRecentlyViewed(id)} className="hover:underline">
								<span className="line-clamp-2">{name}</span>
							</Link>
						</h3>
						<p className="mt-0.5 hidden text-xs text-slate-600 sm:block">{category}</p>
					</div>
					<div className="text-right">
						<p className="text-sm font-semibold text-slate-900 sm:text-base">{formatMoney(price)}</p>
						{compareAtPrice ? (
							<p className="text-xs text-slate-500 line-through">{formatMoney(compareAtPrice)}</p>
						) : (
							<p className="text-xs text-slate-500">&nbsp;</p>
						)}
					</div>
				</div>

				<div className="mt-2 flex items-center gap-2">
					<Stars rating={rating} />
					<span className="text-xs text-slate-600">({reviews})</span>
				</div>
			</div>
		</MotionArticle>
	)
}

export default memo(ProductCard)

