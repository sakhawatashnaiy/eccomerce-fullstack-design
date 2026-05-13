/**
 * App state store placeholder.
 * If you add Redux/Zustand/etc later, configure and export the store from here.
 */

import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../services/apiSlice.js'

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
})

