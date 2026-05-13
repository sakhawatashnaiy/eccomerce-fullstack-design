/**
 * Reusable rating stars.
 */
import { memo } from 'react'

function RatingStars({ rating = 0, size = 'md' }) {
	const fullStars = Math.round(rating)
	const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

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
								? `${sizeClass} text-amber-500`
								: `${sizeClass} text-slate-300`
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
}

export default memo(RatingStars)
