/**
 * Product listing page.
 * Optionally filters by the `category` query param and renders a ProductCard grid.
 */
import { useMemo } from 'react'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { Link, useSearchParams } from 'react-router-dom'
import {
	useAddWishlistItemMutation,
	useGetMyWishlistQuery,
	useGetProductsQuery,
	useGetSellerByIdQuery,
	useRemoveWishlistItemMutation,
} from '../services/apiSlice.js'
import { isSignedIn } from '../utils/authSession.js'

export default function ProductListing() {
	const [searchParams] = useSearchParams()
	const activeCategory = searchParams.get('category')
	const search = searchParams.get('search')
	const sellerId = searchParams.get('sellerId')
	const deals = searchParams.get('deals')
	const wishlistOnly = searchParams.get('wishlist')

	const queryArgs = useMemo(() => {
		return {
			category: activeCategory || undefined,
			search: search || undefined,
			sellerId: sellerId || undefined,
			deals: deals || undefined,
		}
	}, [activeCategory, search, sellerId, deals])

	const { data: visibleProducts = [], isLoading, isError } = useGetProductsQuery(queryArgs)
	const signedIn = isSignedIn()
	const { data: wishlistIds = [] } = useGetMyWishlistQuery(undefined, { skip: !signedIn })
	const { data: seller } = useGetSellerByIdQuery(sellerId, { skip: !sellerId })
	const [addWishlistItem] = useAddWishlistItemMutation()
	const [removeWishlistItem] = useRemoveWishlistItemMutation()
	const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds])

	const filteredProducts = useMemo(() => {
		if (!wishlistOnly) return visibleProducts
		return visibleProducts.filter((product) => wishlistSet.has(product?.id))
	}, [visibleProducts, wishlistOnly, wishlistSet])

	const handleToggleWishlist = async (product) => {
		if (!signedIn) {
			window.alert('Please sign in to use wishlist.')
			return
		}
		const id = product?.id
		if (!id) return
		try {
			if (wishlistSet.has(id)) {
				await removeWishlistItem(id).unwrap()
			} else {
				await addWishlistItem(id).unwrap()
			}
		} catch {
			// Silent fail for now
		}
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								{activeCategory
									? `${activeCategory} products`
									: search
										? `Search results for "${search}"`
										: deals
											? 'Flash deals'
											: wishlistOnly
												? 'Your wishlist'
												: 'All products'}
							</h1>
							<p className="mt-2 text-sm text-slate-600">
								{activeCategory
									? 'Showing products from the selected category.'
									: search
										? 'Filtered by your search query.'
										: deals
											? 'Limited-time prices across the store.'
											: wishlistOnly
												? 'Saved items you can buy later.'
												: 'Browse the full collection of electronics and essentials.'}
							</p>
							{seller ? (
								<p className="mt-2 text-sm text-slate-600">
									Seller: <span className="font-semibold text-slate-900">{seller.name || seller.id}</span>
								</p>
							) : null}
						</div>
						{activeCategory || search || deals || wishlistOnly || sellerId ? (
							<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
								Clear filters
							</Link>
						) : null}
					</div>

					{isLoading ? (
						<p className="mt-8 text-sm text-slate-600">Loading products...</p>
					) : isError ? (
						<p className="mt-8 text-sm text-rose-600">Failed to load products. Check backend connection.</p>
					) : filteredProducts.length === 0 ? (
						<p className="mt-8 text-sm text-slate-600">No products match your filters.</p>
					) : (
						<div className="mt-8 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
								{filteredProducts.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										wishlistIds={wishlistSet}
										onToggleWishlist={handleToggleWishlist}
									/>
							))}
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	)
}

