/**
 * Admin products page.
 * Provides CRUD controls and seed action for backend product collection.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import {
	useCreateProductMutation,
	useDeleteProductMutation,
	useGetProductsQuery,
	useSeedProductsMutation,
	useUpdateProductMutation,
} from '../../services/apiSlice.js'

const initialForm = {
	id: '',
	name: '',
	price: '',
	image: '',
	description: '',
	category: '',
	stocks: '',
	isFeatured: false,
}

function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || ''))
		reader.onerror = () => reject(new Error('Could not read image file'))
		reader.readAsDataURL(file)
	})
}

function extractApiErrorMessage(error, fallback) {
	if (error?.data?.message) return String(error.data.message)
	if (error?.data?.error) return String(error.data.error)
	if (typeof error?.data === 'string' && error.data.trim()) return error.data
	if (error?.error) return String(error.error)
	if (error?.message) return String(error.message)
	return fallback
}

export default function AdminProducts() {
	const [search, setSearch] = useState('')
	const [editingId, setEditingId] = useState('')
	const [form, setForm] = useState(initialForm)
	const [feedback, setFeedback] = useState(null)
	const [isReadingImage, setIsReadingImage] = useState(false)

	useEffect(() => {
		if (!feedback) return
		const timeoutId = window.setTimeout(() => setFeedback(null), 4000)
		return () => window.clearTimeout(timeoutId)
	}, [feedback])

	const { data: products = [], isLoading, isError } = useGetProductsQuery({ search })
	const [createProduct, { isLoading: isCreating, isError: hasCreateError, error: createError }] = useCreateProductMutation()
	const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
	const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
	const [seedProducts, { isLoading: isSeeding }] = useSeedProductsMutation()

	const isBusy = isCreating || isUpdating || isDeleting || isSeeding
	const imagePreview = String(form.image || '').trim()
	const createErrorMessage = hasCreateError
		? extractApiErrorMessage(createError, 'Could not create product. Please try again.')
		: ''

	const sortedProducts = useMemo(() => {
		return [...products].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
	}, [products])

	const onChange = (key) => (event) => {
		const value = key === 'isFeatured' ? event.target.checked : event.target.value
		setForm((prev) => ({ ...prev, [key]: value }))
	}

	const onImageFileChange = async (event) => {
		const file = event.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			setFeedback({ type: 'error', message: 'Please select a valid image file.' })
			event.target.value = ''
			return
		}

		try {
			setIsReadingImage(true)
			const dataUrl = await fileToDataUrl(file)
			setForm((prev) => ({ ...prev, image: dataUrl }))
		} catch (error) {
			setFeedback({ type: 'error', message: error.message || 'Could not process image file.' })
		} finally {
			setIsReadingImage(false)
		}
	}

	const resetForm = () => {
		setEditingId('')
		setForm(initialForm)
	}

	const showSuccess = (message) => setFeedback({ type: 'success', message })
	const showError = (error, fallback) => {
		const message = extractApiErrorMessage(error, fallback)
		setFeedback({ type: 'error', message })
	}

	const startEdit = (product) => {
		setEditingId(product.id)
		setForm({
			id: product.id,
			name: product.name ?? '',
			price: product.price ?? '',
			image: product.image ?? '',
			description: product.description ?? '',
			category: product.category ?? '',
			stocks: product.stocks ?? '',
			isFeatured: Boolean(product.isFeatured),
		})
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const onSubmit = async (event) => {
		event.preventDefault()

		if (!editingId && !String(form.image || '').trim()) {
			setFeedback({ type: 'error', message: 'Please select an image file.' })
			return
		}

		const payload = {
			...(editingId ? {} : { id: form.id.trim() || undefined }),
			name: form.name.trim(),
			price: Number(form.price),
			image: String(form.image || '').trim(),
			description: form.description.trim(),
			category: form.category.trim(),
			stocks: Number(form.stocks),
			isFeatured: Boolean(form.isFeatured),
		}

		try {
			if (editingId) {
				await updateProduct({ id: editingId, ...payload }).unwrap()
				showSuccess('Product updated successfully.')
			} else {
				await createProduct(payload).unwrap()
				showSuccess('Product created successfully.')
			}

			resetForm()
		} catch (error) {
			if (editingId) {
				showError(error, 'Could not update product.')
			} else {
				showError(error, 'Could not create product. Please check required fields and image upload.')
			}
		}
	}

	const onDelete = async (id) => {
		const isConfirmed = window.confirm('Delete this product? This action cannot be undone.')
		if (!isConfirmed) return

		try {
			await deleteProduct(id).unwrap()
			if (editingId === id) resetForm()
			showSuccess('Product deleted successfully.')
		} catch (error) {
			showError(error, 'Could not delete product.')
		}
	}

	const onSeed = async () => {
		try {
			const result = await seedProducts().unwrap()
			const inserted = result?.data?.inserted
			showSuccess(inserted ? `Seeded ${inserted} products.` : 'Sample products seeded successfully.')
		} catch (error) {
			showError(error, 'Could not seed sample products.')
		}
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar />
			<main className="bg-slate-50">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					{feedback ? (
						<div
							className={
								'mb-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-base ring-1 ' +
								(feedback.type === 'success'
									? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
									: 'bg-rose-50 text-rose-700 ring-rose-200')
							}
						>
							<span>{feedback.message}</span>
							<button
								type="button"
								onClick={() => setFeedback(null)}
								className="rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-current/25 hover:bg-white/40"
							>
								Dismiss
							</button>
						</div>
					) : null}

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Admin panel</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Product management
							</h1>
							<p className="mt-2 text-base text-slate-600">
								Create, edit, delete, and seed products from backend.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to="/admin/orders"
								className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-base font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
							>
								Orders
							</Link>
							<button
								type="button"
								onClick={onSeed}
								disabled={isBusy}
								className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-base font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSeeding ? 'Seeding...' : 'Seed sample data'}
							</button>
						</div>
					</div>

					<div className="mt-8 grid gap-6 lg:grid-cols-12">
						<section className="lg:col-span-5">
							<form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
								<p className="text-base font-semibold text-slate-900">{editingId ? 'Update product' : 'Create product'}</p>
								<div className="mt-4 grid gap-3">
									{!editingId ? (
										<input
											type="text"
											placeholder="ID (optional, e.g. p_100)"
											value={form.id}
											onChange={onChange('id')}
											className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										/>
									) : null}
									<input
										type="text"
										required
										placeholder="Product name"
										value={form.name}
										onChange={onChange('name')}
										className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									/>
									<input
										type="number"
										required
										min="0"
										placeholder="Price"
										value={form.price}
										onChange={onChange('price')}
										className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									/>
									<div className="grid gap-3 sm:grid-cols-2">
										<input
											type="text"
											required
											placeholder="Category"
											value={form.category}
											onChange={onChange('category')}
											className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										/>
										<input
											type="number"
											required
											min="0"
											placeholder="Stock"
											value={form.stocks}
											onChange={onChange('stocks')}
											className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										/>
									</div>

									<label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700">
										<span className="font-semibold text-slate-900">Featured product</span>
										<input
											type="checkbox"
											checked={form.isFeatured}
											onChange={onChange('isFeatured')}
											className="h-4 w-4 rounded border-slate-300 text-slate-950"
										/>
									</label>

									<textarea
										required
										placeholder="Description"
										value={form.description}
										onChange={onChange('description')}
										rows={4}
										className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									/>

									<div>
										<label className="text-base font-semibold text-slate-900">Product image</label>
										<input
											type="file"
											accept="image/*"
											onChange={onImageFileChange}
											className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-900"
										/>
										{isReadingImage ? <p className="mt-2 text-sm text-slate-500">Processing image…</p> : null}
										{imagePreview ? (
											<img src={imagePreview} alt="Preview" className="mt-3 h-32 w-full rounded-lg object-cover" />
										) : null}
									</div>

									<div className="flex flex-wrap gap-2 pt-2">
										<button
											type="submit"
											disabled={isBusy}
											className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-base font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{editingId ? 'Update product' : 'Create product'}
										</button>
										<button
											type="button"
											onClick={resetForm}
											className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
										>
											Reset
										</button>
									</div>
									{createErrorMessage ? <p className="mt-2 text-sm font-semibold text-rose-600">{createErrorMessage}</p> : null}
								</div>
							</form>
						</section>

						<section className="lg:col-span-7">
							<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-base font-semibold text-slate-900">Products ({products.length})</p>
										<p className="mt-1 text-sm text-slate-600">Manage product catalog entries.</p>
									</div>
									<input
										value={search}
										onChange={(event) => setSearch(event.target.value)}
										placeholder="Search products..."
										className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									/>
								</div>

								<div className="mt-6 grid gap-4">
									{isLoading ? (
										<div className="grid gap-3">
											{Array.from({ length: 6 }).map((_, index) => (
												<div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
											))}
										</div>
									) : isError ? (
										<div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
											Could not load products.
										</div>
									) : sortedProducts.length === 0 ? (
										<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
											No products match your search.
										</div>
									) : (
										sortedProducts.map((product) => (
											<div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-5">
												<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
													<div className="flex items-center gap-4">
														<img
															src={product.image}
															alt={product.name}
															className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
														/>
														<div>
															<p className="text-base font-semibold text-slate-900">{product.name}</p>
															<p className="text-sm text-slate-500">ID: {product.id}</p>
															<p className="text-sm text-slate-500">Category: {product.category}</p>
														</div>
													</div>
													<div className="text-base text-slate-700">
														<p>
															<span className="font-semibold text-slate-900">Price:</span> ${product.price}
														</p>
														<p>
															<span className="font-semibold text-slate-900">Stock:</span> {product.stocks}
														</p>
													</div>
													<div className="flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() => startEdit(product)}
															className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
														>
															Edit
														</button>
														<button
															type="button"
															onClick={() => onDelete(product.id)}
															className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
														>
															Delete
														</button>
													</div>
												</div>
											</div>
										))
									)
									}
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}
