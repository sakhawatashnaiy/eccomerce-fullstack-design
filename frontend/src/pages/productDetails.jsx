/**
 * Product details page.
 * Finds a product by route param `id`, tracks recently viewed, and allows add-to-cart.
 */
import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { addToCart } from '../utils/cart.js'
import { addRecentlyViewed } from '../utils/recentlyViewed.js'
import {
	useAddWishlistItemMutation,
	useCreateOrUpdateReviewMutation,
	useGetMyWishlistQuery,
	useGetProductByIdQuery,
	useGetProductRecommendationsQuery,
	useGetProductReviewsQuery,
	useGetSellerByIdQuery,
	useRemoveWishlistItemMutation,
} from '../services/apiSlice.js'
import { isSignedIn } from '../utils/authSession.js'

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

function isDealActive(product) {
	const deal = product?.deal
	if (!deal || typeof deal !== 'object') return false
	if (!(Number(deal.price) > 0)) return false
	if (deal.startsAt) {
		const starts = new Date(deal.startsAt)
		if (!Number.isNaN(starts.getTime()) && Date.now() < starts.getTime()) return false
	}
	if (deal.endsAt) {
		const ends = new Date(deal.endsAt)
		if (!Number.isNaN(ends.getTime()) && Date.now() > ends.getTime()) return false
	}
	return true
}

function formatDealCountdown(endsAt) {
	if (!endsAt) return ''
	const end = new Date(endsAt).getTime()
	if (Number.isNaN(end)) return ''
	const diff = Math.max(0, end - Date.now())
	const hours = Math.floor(diff / 1000 / 60 / 60)
	const mins = Math.floor((diff / 1000 / 60) % 60)
	return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`
}

export default function ProductDetails() {
	const { id } = useParams()
	const { data: product, isLoading, isError } = useGetProductByIdQuery(id)
	const signedIn = isSignedIn()
	const { data: wishlistIds = [] } = useGetMyWishlistQuery(undefined, { skip: !signedIn })
	const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds])
	const [addWishlistItem] = useAddWishlistItemMutation()
	const [removeWishlistItem] = useRemoveWishlistItemMutation()
	const { data: reviews = [] } = useGetProductReviewsQuery(id)
	const [createOrUpdateReview, { isLoading: isSubmittingReview }] = useCreateOrUpdateReviewMutation()
	const { data: recommendations = [] } = useGetProductRecommendationsQuery(
		{ id, limit: 8 },
		{ skip: !id }
	)
	const { data: seller } = useGetSellerByIdQuery(product?.sellerId, { skip: !product?.sellerId })
	const [selectedVariantId, setSelectedVariantId] = useState('')
	const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' })
	const [reviewFeedback, setReviewFeedback] = useState('')

	const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product?.variants])
	const selectedVariant = useMemo(
		() => variants.find((v) => String(v.id) === String(selectedVariantId)) || null,
		[variants, selectedVariantId]
	)
	const dealActive = useMemo(() => isDealActive(product), [product])
	const dealPrice = dealActive ? Number(product?.deal?.price) : null
	const dealCountdown = dealActive ? formatDealCountdown(product?.deal?.endsAt) : ''
	const displayPrice = dealPrice != null
		? dealPrice
		: selectedVariant?.price != null
			? Number(selectedVariant.price)
			: Number(product?.price)

	useEffect(() => {
		if (product?.id) addRecentlyViewed(product.id)
	}, [product?.id])

	useEffect(() => {
		if (!variants.length) return
		if (selectedVariantId) return
		setSelectedVariantId(String(variants[0].id || ''))
	}, [variants, selectedVariantId])

	const isWishlisted = Boolean(product?.id && wishlistSet.has(product.id))
	const handleToggleWishlist = async (target = product) => {
		if (!target?.id) return
		if (!signedIn) {
			setReviewFeedback('Please sign in to use wishlist.')
			return
		}
		try {
			if (wishlistSet.has(target.id)) {
				await removeWishlistItem(target.id).unwrap()
			} else {
				await addWishlistItem(target.id).unwrap()
			}
		} catch {
			setReviewFeedback('Could not update wishlist.')
		}
	}

	const handleReviewSubmit = async (event) => {
		event.preventDefault()
		if (!signedIn) {
			setReviewFeedback('Please sign in to leave a review.')
			return
		}
		if (!product?.id) return
		try {
			setReviewFeedback('')
			await createOrUpdateReview({
				id: product.id,
				rating: Number(reviewForm.rating),
				text: String(reviewForm.text || '').trim(),
			}).unwrap()
			setReviewForm({ rating: 5, text: '' })
			setReviewFeedback('Thanks for your review!')
		} catch (error) {
			const message = error?.data?.message || error?.error || 'Could not submit review.'
			setReviewFeedback(String(message))
		}
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

					{isLoading ? (
						<div className="rounded-2xl border border-slate-200 bg-white p-6">
							<h1 className="text-xl font-semibold text-slate-900">Loading product...</h1>
						</div>
					) : isError || !product ? (
						<div className="rounded-2xl border border-slate-200 bg-white p-6">
							<h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
							<p className="mt-2 text-sm text-slate-600">This product may have been removed or backend is offline.</p>
						</div>
					) : (
						<div className="grid gap-8 lg:grid-cols-12">
							<div className="lg:col-span-7">
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
									<div className="aspect-[2/2] object-fit bg-slate-100">
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

									<div className="mt-5 flex items-start justify-between gap-3">
										<div>
											<p className="text-2xl font-semibold text-slate-900">{formatMoney(displayPrice)}</p>
											{dealActive ? (
												<p className="text-sm text-rose-600">{dealCountdown || 'Flash deal active'}</p>
											) : null}
											{product.compareAtPrice || dealActive ? (
												<p className="text-sm text-slate-500 line-through">
													{formatMoney(product.compareAtPrice || product.price)}
												</p>
											) : null}
										</div>
										<span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
											{product.rating} ★ ({product.reviews})
										</span>
									</div>

									{variants.length ? (
										<div className="mt-5">
											<p className="text-xs font-semibold text-slate-600">Choose variant</p>
											<div className="mt-2 flex flex-wrap gap-2">
												{variants.map((variant) => (
													<button
														key={variant.id}
														type="button"
														onClick={() => setSelectedVariantId(String(variant.id))}
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

									<div className="mt-6 grid gap-3 sm:grid-cols-2">
										<button
											type="button"
											className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
											onClick={() =>
												addToCart(product, 1, {
													variantId: selectedVariant?.id || null,
													variantLabel: selectedVariant?.label || null,
													price: displayPrice,
												})
											}
										>
											Add to cart
										</button>
										<button
											type="button"
											onClick={handleToggleWishlist}
											className={
												'inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ring-1 transition-colors ' +
												(isWishlisted
													? 'bg-rose-600 text-white ring-rose-600'
													: 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50')
											}
										>
											{isWishlisted ? 'Wishlisted' : 'Save to wishlist'}
										</button>
									</div>

									<div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
										<p className="text-sm font-semibold text-slate-900">Delivery & returns</p>
										<p className="mt-1 text-sm text-slate-600">Fast shipping. Simple 30-day returns.</p>
									</div>
									{seller || product?.seller ? (
										<div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
											<p className="text-xs font-semibold text-slate-500">Seller</p>
											<p className="mt-1 text-sm font-semibold text-slate-900">{seller?.name || product?.seller?.name || product?.sellerId}</p>
											<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
												<span>Rating: {seller?.rating ?? '—'}</span>
												<span>Followers: {seller?.followers ?? '—'}</span>
											</div>
											<Link
												to={`/products?sellerId=${encodeURIComponent(product?.sellerId || seller?.id || '')}`}
												className="mt-3 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-500"
											>
												View seller store
											</Link>
										</div>
									) : null}
								</div>
							</div>
						</div>
					)}

					{!isLoading && !isError && product ? (
						<div className="mt-10 space-y-10">
							<section className="rounded-2xl border border-slate-200 bg-white p-6">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
									<span className="text-sm text-slate-600">{reviews.length} total</span>
								</div>

								<form onSubmit={handleReviewSubmit} className="mt-4 grid gap-3 sm:grid-cols-6">
									<div className="sm:col-span-1">
										<label className="text-xs font-semibold text-slate-600">Rating</label>
										<select
											value={reviewForm.rating}
											onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
											className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
										>
											{[5, 4, 3, 2, 1].map((value) => (
												<option key={value} value={value}>
													{value} ★
												</option>
											))}
										</select>
									</div>
									<div className="sm:col-span-4">
										<label className="text-xs font-semibold text-slate-600">Write a review</label>
										<input
											type="text"
											value={reviewForm.text}
											onChange={(e) => setReviewForm((prev) => ({ ...prev, text: e.target.value }))}
											placeholder="Share your experience"
											className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
										/>
									</div>
									<div className="sm:col-span-1 sm:pt-6">
										<button
											type="submit"
											disabled={isSubmittingReview}
											className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{isSubmittingReview ? 'Saving…' : 'Submit'}
										</button>
									</div>
								</form>

								{reviewFeedback ? <p className="mt-2 text-xs text-slate-600">{reviewFeedback}</p> : null}

								<div className="mt-6 space-y-4">
									{reviews.length === 0 ? (
										<p className="text-sm text-slate-600">No reviews yet. Be the first to share one.</p>
									) : (
										reviews.map((review) => (
											<div key={review.id} className="rounded-xl border border-slate-200 p-4">
												<p className="text-sm font-semibold text-slate-900">
													{review.displayName || 'Anonymous'}
												</p>
												<p className="mt-1 text-xs text-slate-600">{review.rating} ★</p>
												{review.text ? <p className="mt-2 text-sm text-slate-700">{review.text}</p> : null}
											</div>
										))
									)}
								</div>
							</section>

							{recommendations.length ? (
								<section>
									<h2 className="text-lg font-semibold text-slate-900">You may also like</h2>
									<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
										{recommendations.map((item) => (
											<ProductCard
												key={item.id}
												product={item}
												wishlistIds={wishlistSet}
												onToggleWishlist={() => handleToggleWishlist(item)}
											/>
										))}
									</div>
								</section>
							) : null}
						</div>
					) : null}
				</div>
			</main>
			<Footer />
		</div>
	)
}
