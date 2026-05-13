/**
 * Variant, size, and color selectors.
 */
export default function VariantSelector({
	variants = [],
	selectedVariantId,
	onSelectVariant,
	sizeOptions = [],
	selectedSize,
	onSelectSize,
	colorOptions = [],
	selectedColor,
	onSelectColor,
}) {
	return (
		<>
			{variants.length ? (
				<div className="mt-5">
					<p className="text-xs font-semibold text-slate-600">Choose variant</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{variants.map((variant) => (
							<button
								key={variant.id}
								type="button"
								onClick={() => onSelectVariant?.(String(variant.id))}
								className={
									'rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
									(String(variant.id) === String(selectedVariantId)
										? 'bg-slate-950 text-white ring-slate-950'
										: 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
								}
							>
								{variant.label || variant.id}
							</button>
						))}
					</div>
				</div>
			) : null}

			{sizeOptions.length ? (
				<div className="mt-4">
					<p className="text-xs font-semibold text-slate-600">Size</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{sizeOptions.map((size) => (
							<button
								key={size}
								type="button"
								onClick={() => onSelectSize?.(size)}
								className={
									'rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
									(selectedSize === size
										? 'bg-slate-950 text-white ring-slate-950'
										: 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
								}
							>
								{size}
							</button>
						))}
					</div>
				</div>
			) : null}

			{colorOptions.length ? (
				<div className="mt-4">
					<p className="text-xs font-semibold text-slate-600">Choose color</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{colorOptions.map((color) => {
							const isActive = color === selectedColor
							return (
								<button
									key={color}
									type="button"
									onClick={() => onSelectColor?.(color)}
									className={
										'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
										(isActive
											? 'bg-slate-950 text-white ring-slate-950'
											: 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
									}
								>
									<span
										className="h-3 w-3 rounded-full ring-1 ring-slate-200"
										style={{ backgroundColor: color }}
									/>
									{color}
								</button>
							)
						})}
					</div>
				</div>
			) : null}
		</>
	)
}
