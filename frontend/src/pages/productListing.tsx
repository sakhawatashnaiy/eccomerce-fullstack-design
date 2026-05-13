/**
 * Product listing page.
 * Optionally filters by the `category` query param and renders a ProductCard grid.
 */
import { useEffect, useMemo, useState } from 'react'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
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
	const [searchParams, setSearchParams] = useSearchParams()
	const activeCategory = searchParams.get('category')
	const search = searchParams.get('search')
	const sellerId = searchParams.get('sellerId')
	const deals = searchParams.get('deals')
	const rating = searchParams.get('rating')
	const brand = searchParams.get('brand')
	const sort = searchParams.get('sort')
	const priceMin = searchParams.get('priceMin')
	const priceMax = searchParams.get('priceMax')
	const wishlistOnly = searchParams.get('wishlist')

	const [searchText, setSearchText] = useState(search || '')
	const [minPrice, setMinPrice] = useState(priceMin || '')
	const [maxPrice, setMaxPrice] = useState(priceMax || '')
	const [selectedBrand, setSelectedBrand] = useState(brand || '')
	const [selectedRating, setSelectedRating] = useState(rating || '')
	const [selectedSort, setSelectedSort] = useState(sort || 'newest')

	const updateParam = (key, value) => {
		const next = new URLSearchParams(searchParams)
		const stringValue = String(value || '').trim()
		if (!stringValue) {
			next.delete(key)
		} else {
			next.set(key, stringValue)
		}
		setSearchParams(next)
	}

	const queryArgs = useMemo(() => {
		return {
			category: activeCategory || undefined,
			search: search || undefined,
			sellerId: sellerId || undefined,
			deals: deals || undefined,
			rating: rating || undefined,
			brand: brand || undefined,
			sort: sort || undefined,
			priceMin: priceMin || undefined,
			priceMax: priceMax || undefined,
		}
	}, [activeCategory, search, sellerId, deals, rating, brand, sort, priceMin, priceMax])

	const { data: visibleProducts = [], isLoading, isError } = useGetProductsQuery(queryArgs)
	const { data: allProducts = [] } = useGetProductsQuery({})
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

	const categoryOptions = useMemo(() => {
		const set = new Set()
		allProducts.forEach((product) => {
			const value = String(product?.category || '').trim()
			if (value) set.add(value)
		})
		return Array.from(set)
	}, [allProducts])

	const brandOptions = useMemo(() => {
		const set = new Set()
		allProducts.forEach((product) => {
			const value = String(product?.brand || '').trim()
			if (value) set.add(value)
		})
		return Array.from(set)
	}, [allProducts])

	useEffect(() => {
		setSearchText(search || '')
		setMinPrice(priceMin || '')
		setMaxPrice(priceMax || '')
		setSelectedBrand(brand || '')
		setSelectedRating(rating || '')
		setSelectedSort(sort || 'newest')
	}, [search, priceMin, priceMax, brand, rating, sort])

	useEffect(() => {
		const handle = setTimeout(() => {
			updateParam('search', searchText)
		}, 400)
		return () => clearTimeout(handle)
	}, [searchText])

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

					<div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
						<div className="sm:col-span-2 lg:col-span-2">
							<SearchBar
								placeholder="Search products"
								value={searchText}
								onChange={setSearchText}
								onSubmit={() => updateParam('search', searchText)}
							/>
						</div>
						<div className="sm:col-span-1">
							<label className="text-xs font-semibold text-slate-600">Category</label>
							<select
								value={activeCategory || ''}
								onChange={(e) => updateParam('category', e.target.value)}
								className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
							>
								<option value="">All</option>
								{categoryOptions.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
						<div className="sm:col-span-1">
							<label className="text-xs font-semibold text-slate-600">Brand</label>
							<select
								value={selectedBrand}
								onChange={(e) => {
									setSelectedBrand(e.target.value)
									updateParam('brand', e.target.value)
								}}
								className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
							>
								<option value="">All</option>
								{brandOptions.map((value) => (
									<option key={value} value={value}>
										{value}
									</option>
								))}
							</select>
						</div>
						<div className="sm:col-span-1">
							<label className="text-xs font-semibold text-slate-600">Rating</label>
							<select
								value={selectedRating}
								onChange={(e) => {
									setSelectedRating(e.target.value)
									updateParam('rating', e.target.value)
								}}
								className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
							>
								<option value="">Any</option>
								<option value="4">4+ stars</option>
								<option value="3">3+ stars</option>
								<option value="2">2+ stars</option>
							</select>
						</div>
						<div className="sm:col-span-1">
							<label className="text-xs font-semibold text-slate-600">Sort</label>
							<select
								value={selectedSort}
								onChange={(e) => {
									setSelectedSort(e.target.value)
									updateParam('sort', e.target.value)
								}}
								className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
							>
								<option value="newest">Newest</option>
								<option value="price-asc">Price low to high</option>
								<option value="price-desc">Price high to low</option>
								<option value="popularity">Popularity</option>
								<option value="rating">Ratings</option>
							</select>
						</div>
						<div className="sm:col-span-2 lg:col-span-2">
							<label className="text-xs font-semibold text-slate-600">Price range</label>
							<div className="mt-2 grid grid-cols-2 gap-2">
								<input
									type="number"
									min="0"
									placeholder="Min"
									value={minPrice}
									onChange={(e) => setMinPrice(e.target.value)}
									onBlur={() => updateParam('priceMin', minPrice)}
									className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
								/>
								<input
									type="number"
									min="0"
									placeholder="Max"
									value={maxPrice}
									onChange={(e) => setMaxPrice(e.target.value)}
									onBlur={() => updateParam('priceMax', maxPrice)}
									className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
								/>
							</div>
						</div>
					</div>

					{isLoading ? (
						<div className="mt-8 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
							{Array.from({ length: 8 }).map((_, index) => (
								<div key={index} className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white" />
							))}
						</div>
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

