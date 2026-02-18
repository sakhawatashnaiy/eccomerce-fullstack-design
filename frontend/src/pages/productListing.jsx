/**
 * Product listing page.
 * Optionally filters by the `category` query param and renders a ProductCard grid.
 */
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { Link, useSearchParams } from 'react-router-dom'
import { useGetProductsQuery } from '../services/apiSlice.js'

export default function ProductListing() {
	const [searchParams] = useSearchParams()
	const activeCategory = searchParams.get('category')
	const search = searchParams.get('search')

	const { data: visibleProducts = [], isLoading, isError } = useGetProductsQuery({
		category: activeCategory || undefined,
		search: search || undefined,
	})

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />

			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								{activeCategory
									? `${activeCategory} products`
									: search
										? `Search results for "${search}"`
										: 'All products'}
							</h1>
							<p className="mt-2 text-sm text-slate-600">
								{activeCategory
									? 'Showing products from the selected category.'
									: search
										? 'Filtered by your search query.'
										: 'Browse the full collection of electronics and essentials.'}
							</p>
						</div>
						{activeCategory || search ? (
							<Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
								Clear filters
							</Link>
						) : null}
					</div>

					{isLoading ? (
						<p className="mt-8 text-sm text-slate-600">Loading products...</p>
					) : isError ? (
						<p className="mt-8 text-sm text-rose-600">Failed to load products. Check backend connection.</p>
					) : visibleProducts.length === 0 ? (
						<p className="mt-8 text-sm text-slate-600">No products match your filters.</p>
					) : (
						<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{visibleProducts.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	)
}

