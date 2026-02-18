/**
 * API layer placeholder.
 * Put shared API client logic here (fetch helpers / RTK Query / Axios, etc.).
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
	tagTypes: ['Products'],
	endpoints: (builder) => ({
		getProducts: builder.query({
			query: (params = {}) => {
				const query = new URLSearchParams()
				Object.entries(params).forEach(([key, value]) => {
					if (value !== undefined && value !== null && String(value).trim() !== '') {
						query.set(key, String(value))
					}
				})
				const suffix = query.toString() ? `?${query.toString()}` : ''
				return `/products${suffix}`
			},
			transformResponse: (response) => response?.data ?? [],
			providesTags: ['Products'],
		}),
		getProductById: builder.query({
			query: (id) => `/products/${id}`,
			transformResponse: (response) => response?.data,
			providesTags: (_result, _error, id) => [{ type: 'Products', id }],
		}),
		createProduct: builder.mutation({
			query: (payload) => ({ url: '/products', method: 'POST', body: payload }),
			invalidatesTags: ['Products'],
		}),
		updateProduct: builder.mutation({
			query: ({ id, ...payload }) => ({ url: `/products/${id}`, method: 'PUT', body: payload }),
			invalidatesTags: (_result, _error, { id }) => ['Products', { type: 'Products', id }],
		}),
		deleteProduct: builder.mutation({
			query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
			invalidatesTags: ['Products'],
		}),
		seedProducts: builder.mutation({
			query: () => ({ url: '/products/seed', method: 'POST' }),
			invalidatesTags: ['Products'],
		}),
	}),
})

export const {
	useGetProductsQuery,
	useGetProductByIdQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
	useSeedProductsMutation,
} = apiSlice

