/**
 * Admin products page.
 * Provides CRUD controls and seed action for backend product collection.
 */

import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import {
	useCreateProductMutation,
	useDeleteProductMutation,
	useGetProductsQuery,
	useSeedProductsMutation,
	useUpdateProductMutation,
} from '../services/apiSlice.js'

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
								'mb-4 flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm ring-1 ' +
								(feedback.type === 'success'
									? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
									: 'bg-rose-50 text-rose-700 ring-rose-200')
							}
						>
							<span>{feedback.message}</span>
							<button
								type="button"
								onClick={() => setFeedback(null)}
								className="rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-current/25 hover:bg-white/40"
							>
								Dismiss
							</button>
						</div>
					) : null}

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold text-slate-600">Admin panel</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Product management
							</h1>
							<p className="mt-2 text-sm text-slate-600">Create, edit, delete, and seed products from backend.</p>
						</div>
						<button
							type="button"
							onClick={onSeed}
							disabled={isBusy}
							className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSeeding ? 'Seeding...' : 'Seed sample data'}
						</button>
					</div>

					<div className="mt-8 grid gap-6 lg:grid-cols-12">
						<section className="lg:col-span-5">
							<form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
								<p className="text-sm font-semibold text-slate-900">{editingId ? 'Update product' : 'Create product'}</p>
								<div className="mt-4 grid gap-3">
									{!editingId ? (
										<input
											type="text"
											placeholder="ID (optional, e.g. p_100)"
											value={form.id}
											onChange={onChange('id')}
											className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
										/>
									) : null}
									<input
										type="text"
										required
										placeholder="Product name"
										value={form.name}
										onChange={onChange('name')}
										className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
									/>
									<input
										type="number"
										required
										min="0"
										placeholder="Price"
										value={form.price}
										onChange={onChange('price')}
										className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
									/>
									<label className="grid gap-2 text-sm text-slate-700">
										<span className="font-semibold text-slate-900">Product image</span>
										<input
											type="file"
											accept="image/*"
											onChange={onImageFileChange}
											disabled={isBusy || isReadingImage}
											className="h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
										/>
									</label>
									{isReadingImage ? <p className="text-xs text-slate-500">Processing image...</p> : null}
									{imagePreview ? (
										<div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
											<div className="aspect-video">
												<img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
											</div>
										</div>
									) : null}
									<input
										type="text"
										required
										placeholder="Category"
										value={form.category}
										onChange={onChange('category')}
										className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
									/>
									<input
										type="number"
										required
										min="0"
										placeholder="Stocks"
										value={form.stocks}
										onChange={onChange('stocks')}
										className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
									/>
									<textarea
										required
										rows={4}
										placeholder="Description"
										value={form.description}
										onChange={onChange('description')}
										className="w-full rounded-lg border border-slate-200 p-3 text-sm"
									/>
									<label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
										<input
											type="checkbox"
											checked={form.isFeatured}
											onChange={onChange('isFeatured')}
										/>
										Featured product
									</label>
								</div>

								<div className="mt-4 flex gap-2">
									<button
										type="submit"
										disabled={isBusy}
										className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{isUpdating ? 'Updating...' : isCreating ? 'Creating...' : editingId ? 'Update' : 'Create'}
									</button>
									{editingId ? (
										<button
											type="button"
											onClick={resetForm}
											className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
										>
											Cancel edit
										</button>
									) : null}
								</div>
								{!editingId && createErrorMessage ? (
									<p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
										{createErrorMessage}
									</p>
								) : null}
							</form>
						</section>

						<section className="lg:col-span-7">
							<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm font-semibold text-slate-900">Products ({products.length})</p>
									<input
										type="search"
										placeholder="Search by name or category"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm sm:max-w-sm"
									/>
								</div>

								{isLoading ? (
									<p className="mt-6 text-sm text-slate-600">Loading products...</p>
								) : isError ? (
									<p className="mt-6 text-sm text-rose-600">Failed to load products from backend.</p>
								) : sortedProducts.length === 0 ? (
									<p className="mt-6 text-sm text-slate-600">No products found.</p>
								) : (
									<div className="mt-6 space-y-3">
										{sortedProducts.map((product) => (
											<div key={product.id} className="rounded-xl border border-slate-200 p-4">
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0">
														<p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
														<p className="mt-1 text-xs text-slate-600">
															{product.category} • ${product.price} • stock {product.stocks}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => startEdit(product)}
															className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
														>
															Edit
														</button>
														<button
															type="button"
															onClick={() => onDelete(product.id)}
															disabled={isBusy}
															className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
														>
															Delete
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</section>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}
