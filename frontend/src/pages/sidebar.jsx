/**
 * Sidebar filter UI.
 * Provides reusable filter controls (category/price/rating/brand/etc.).
 */
import { useMemo, useState } from 'react'

function cx(...classes) {
	return classes.filter(Boolean).join(' ')
}

const DEFAULT_CATEGORIES = ['New in', 'Essentials', 'Accessories', 'Home']
const DEFAULT_BRANDS = ['Studio', 'Modern Co.', 'Essentials', 'Crafted']
const DEFAULT_PRICE = [
	{ id: 'any', label: 'Any', value: 'any' },
	{ id: 'under-25', label: 'Under $25', value: 'under-25' },
	{ id: '25-75', label: '$25 to $75', value: '25-75' },
	{ id: '75-150', label: '$75 to $150', value: '75-150' },
	{ id: '150-plus', label: '$150+', value: '150-plus' },
]
const DEFAULT_RATING = [
	{ id: '4up', label: '4★ & up', value: '4up' },
	{ id: '3up', label: '3★ & up', value: '3up' },
	{ id: '2up', label: '2★ & up', value: '2up' },
]

function SectionTitle({ children }) {
	return <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
}

function Divider() {
	return <div className="my-5 h-px w-full bg-slate-200" />
}

function CheckboxRow({ id, label, checked, onChange }) {
	return (
		<label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
			/>
			<span className="text-sm text-slate-700">{label}</span>
		</label>
	)
}

function RadioRow({ name, id, label, checked, onChange }) {
	return (
		<label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
			<input
				id={id}
				type="radio"
				name={name}
				checked={checked}
				onChange={() => onChange()}
				className="h-4 w-4 border-slate-300 text-slate-950 focus:ring-slate-950"
			/>
			<span className="text-sm text-slate-700">{label}</span>
		</label>
	)
}

function StarPill({ label }) {
	return (
		<span className="inline-flex items-center gap-1 text-sm text-slate-700">
			<svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-500" aria-hidden="true">
				<path
					d="M10 14.6l-4.1 2.2.8-4.6L3.4 9 8 8.3 10 4l2 4.3 4.6.7-3.3 3.2.8 4.6L10 14.6z"
					fill="currentColor"
				/>
			</svg>
			{label}
		</span>
	)
}

function SidebarBody({
	categories,
	brands,
	selectedCategories,
	setSelectedCategories,
	selectedBrands,
	setSelectedBrands,
	price,
	setPrice,
	rating,
	setRating,
	inStockOnly,
	setInStockOnly,
	shippingFast,
	setShippingFast,
}) {
	return (
		<div className="w-full">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-base font-semibold text-slate-900">Filters</p>
					<p className="mt-1 text-sm text-slate-600">Refine products by what matters.</p>
				</div>
				<button
					type="button"
					className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 lg:inline-flex"
					onClick={() => {
						setSelectedCategories([])
						setSelectedBrands([])
						setPrice('any')
						setRating('')
						setInStockOnly(false)
						setShippingFast(false)
					}}
				>
					Clear
				</button>
			</div>

			<Divider />

			<SectionTitle>Category</SectionTitle>
			<div className="mt-2">
				{categories.map((c) => (
					<CheckboxRow
						key={c}
						id={`cat-${c}`}
						label={c}
						checked={selectedCategories.includes(c)}
						onChange={(next) => {
							setSelectedCategories((prev) => {
								if (next) return prev.includes(c) ? prev : [...prev, c]
								return prev.filter((x) => x !== c)
							})
						}}
					/>
				))}
			</div>

			<Divider />

			<SectionTitle>Price</SectionTitle>
			<div className="mt-2">
				{DEFAULT_PRICE.map((p) => (
					<RadioRow
						key={p.id}
						name="price"
						id={`price-${p.id}`}
						label={p.label}
						checked={price === p.value}
						onChange={() => setPrice(p.value)}
					/>
				))}
			</div>

			<Divider />

			<SectionTitle>Rating</SectionTitle>
			<div className="mt-2">
				{DEFAULT_RATING.map((r) => (
					<label
						key={r.id}
						htmlFor={`rating-${r.id}`}
						className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
					>
						<div className="flex items-center gap-3">
							<input
								id={`rating-${r.id}`}
								type="radio"
								name="rating"
								checked={rating === r.value}
								onChange={() => setRating(r.value)}
								className="h-4 w-4 border-slate-300 text-slate-950 focus:ring-slate-950"
							/>
							<StarPill label={r.label} />
						</div>
					</label>
				))}
				<label
					htmlFor="rating-any"
					className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
				>
					<input
						id="rating-any"
						type="radio"
						name="rating"
						checked={rating === ''}
						onChange={() => setRating('')}
						className="h-4 w-4 border-slate-300 text-slate-950 focus:ring-slate-950"
					/>
					<span className="text-sm text-slate-700">Any rating</span>
				</label>
			</div>

			<Divider />

			<SectionTitle>Brand</SectionTitle>
			<div className="mt-2">
				{brands.map((b) => (
					<CheckboxRow
						key={b}
						id={`brand-${b}`}
						label={b}
						checked={selectedBrands.includes(b)}
						onChange={(next) => {
							setSelectedBrands((prev) => {
								if (next) return prev.includes(b) ? prev : [...prev, b]
								return prev.filter((x) => x !== b)
							})
						}}
					/>
				))}
			</div>

			<Divider />

			<SectionTitle>Availability</SectionTitle>
			<div className="mt-2 space-y-2">
				<label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
					<div>
						<p className="text-sm font-semibold text-slate-800">In stock only</p>
						<p className="mt-0.5 text-xs text-slate-500">Hide out-of-stock items</p>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={inStockOnly}
						onClick={() => setInStockOnly((v) => !v)}
						className={cx(
							'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 ring-inset transition-none',
							inStockOnly ? 'bg-slate-950 ring-slate-950' : 'bg-slate-200 ring-slate-300'
						)}
					>
						<span
							className={cx(
								'inline-block h-5 w-5 rounded-full bg-white ring-1 ring-slate-300 transition-none',
								inStockOnly ? 'translate-x-5' : 'translate-x-1'
							)}
						/>
					</button>
				</label>

				<label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
					<div>
						<p className="text-sm font-semibold text-slate-800">Fast shipping</p>
						<p className="mt-0.5 text-xs text-slate-500">Delivery in 24–48 hours</p>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={shippingFast}
						onClick={() => setShippingFast((v) => !v)}
						className={cx(
							'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 ring-inset transition-none',
							shippingFast ? 'bg-slate-950 ring-slate-950' : 'bg-slate-200 ring-slate-300'
						)}
					>
						<span
							className={cx(
								'inline-block h-5 w-5 rounded-full bg-white ring-1 ring-slate-300 transition-none',
								shippingFast ? 'translate-x-5' : 'translate-x-1'
							)}
						/>
					</button>
				</label>
			</div>
		</div>
	)
}

/**
 * Responsive ecommerce sidebar.
 * - Desktop: sticky sidebar (shows on lg+)
 * - Mobile: “Filters” button + slide-in drawer
 */
export default function Sidebar({
	categories = DEFAULT_CATEGORIES,
	brands = DEFAULT_BRANDS,
	open,
	onOpenChange,
}) {
	const [internalOpen, setInternalOpen] = useState(false)
	const isOpen = open ?? internalOpen
	const setOpen = onOpenChange ?? setInternalOpen

	const [selectedCategories, setSelectedCategories] = useState([])
	const [selectedBrands, setSelectedBrands] = useState([])
	const [price, setPrice] = useState('any')
	const [rating, setRating] = useState('')
	const [inStockOnly, setInStockOnly] = useState(false)
	const [shippingFast, setShippingFast] = useState(false)

	const activeCount = useMemo(() => {
		let count = 0
		count += selectedCategories.length
		count += selectedBrands.length
		if (price !== 'any') count += 1
		if (rating) count += 1
		if (inStockOnly) count += 1
		if (shippingFast) count += 1
		return count
	}, [selectedBrands.length, selectedCategories.length, price, rating, inStockOnly, shippingFast])

	const bodyProps = {
		categories,
		brands,
		selectedCategories,
		setSelectedCategories,
		selectedBrands,
		setSelectedBrands,
		price,
		setPrice,
		rating,
		setRating,
		inStockOnly,
		setInStockOnly,
		shippingFast,
		setShippingFast,
	}

	return (
		<div className="w-full">
			<div className="lg:hidden">
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-sm"
				>
					<span className="inline-flex items-center gap-2">
						<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700" aria-hidden="true">
							<path
								d="M4 6h16M7 12h10M10 18h4"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
							/>
						</svg>
						Filters
					</span>
					{activeCount ? (
						<span className="inline-flex items-center rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
							{activeCount}
						</span>
					) : (
						<span className="text-xs font-medium text-slate-500">All products</span>
					)}
				</button>

				{isOpen ? (
					<div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
						<button
							type="button"
							className="absolute inset-0 bg-black/40"
							onClick={() => setOpen(false)}
							aria-label="Close filters"
						/>
						<div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
							<div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
								<div>
									<p className="text-sm font-semibold text-slate-900">Filters</p>
									<p className="mt-0.5 text-xs text-slate-500">Tap to refine your search</p>
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
										onClick={() => {
											setSelectedCategories([])
											setSelectedBrands([])
											setPrice('any')
											setRating('')
											setInStockOnly(false)
											setShippingFast(false)
										}}
									>
										Clear
									</button>
									<button
										type="button"
										className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
										onClick={() => setOpen(false)}
									>
										Apply
									</button>
									<button
										type="button"
										className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
										onClick={() => setOpen(false)}
										aria-label="Close"
									>
										<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
											<path
												d="M6 6l12 12M18 6L6 18"
												stroke="currentColor"
												strokeWidth="1.8"
												strokeLinecap="round"
											/>
										</svg>
									</button>
								</div>
							</div>
							<div className="h-[calc(100vh-73px)] overflow-y-auto px-4 py-5">
								<SidebarBody {...bodyProps} />
							</div>
						</div>
					</div>
				) : null}
			</div>

			<aside className="hidden lg:block">
				<div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<SidebarBody {...bodyProps} />
					<div className="mt-6 flex items-center gap-3">
						<button
							type="button"
							className="h-11 flex-1 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-900"
						>
							Apply filters
						</button>
						<button
							type="button"
							className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
							onClick={() => {
								setSelectedCategories([])
								setSelectedBrands([])
								setPrice('any')
								setRating('')
								setInStockOnly(false)
								setShippingFast(false)
							}}
						>
							Reset
						</button>
					</div>
				</div>
			</aside>
		</div>
	)
}

