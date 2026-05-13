/**
 * Product image gallery with hover zoom and modal preview.
 */
import { useCallback, useEffect, useState } from 'react'

export default function ProductImageGallery({ images = [], alt = '', activeImage, onChange }) {
	const [isZooming, setIsZooming] = useState(false)
	const [zoomPosition, setZoomPosition] = useState('50% 50%')
	const [zoomModalOpen, setZoomModalOpen] = useState(false)

	const displayImage = activeImage || images[0] || ''

	useEffect(() => {
		if (!activeImage && images.length) {
			onChange?.(images[0])
		}
	}, [activeImage, images, onChange])

	const handleZoomMove = useCallback((event) => {
		const rect = event.currentTarget.getBoundingClientRect()
		const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width)
		const y = Math.min(Math.max(0, event.clientY - rect.top), rect.height)
		setZoomPosition(`${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`)
	}, [])

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
			<div
				className="group relative mx-auto flex aspect-square max-h-[480px] max-w-[480px] items-center justify-center overflow-hidden bg-slate-100"
				onMouseEnter={() => setIsZooming(true)}
				onMouseLeave={() => setIsZooming(false)}
				onMouseMove={handleZoomMove}
				onClick={() => setZoomModalOpen(true)}
				role="button"
				tabIndex={0}
				onKeyDown={(event) => {
					if (event.key === 'Enter') setZoomModalOpen(true)
				}}
			>
				<div
					className={
						'absolute inset-0 transition-opacity duration-200 ' +
						(isZooming ? 'opacity-100' : 'opacity-0')
					}
					style={{
						backgroundImage: displayImage ? `url(${displayImage})` : undefined,
						backgroundPosition: zoomPosition,
						backgroundSize: '180%',
					}}
				/>
				{displayImage ? (
					<img
						src={displayImage}
						alt={alt}
						className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
					/>
				) : (
					<div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-50" />
				)}
				<div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
					Hover or tap to zoom
				</div>
			</div>

			{images.length > 1 ? (
				<div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white px-3 py-3">
					{images.map((image) => (
						<button
							key={image}
							type="button"
							onClick={() => onChange?.(image)}
							className={
								'flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border ' +
								(image === displayImage
									? 'border-slate-900'
									: 'border-slate-200 hover:border-slate-300')
							}
						>
							<img src={image} alt="Thumbnail" className="h-full w-full object-cover" />
						</button>
					))}
				</div>
			) : null}

			{zoomModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
					<button
						type="button"
						className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white"
						onClick={() => setZoomModalOpen(false)}
					>
						Close
					</button>
					<img
						src={displayImage}
						alt={alt}
						className="max-h-[80vh] w-auto rounded-2xl bg-white p-4"
					/>
				</div>
			) : null}
		</div>
	)
}
