/**
 * Top-level route definitions for the app.
 * Maps URL paths to page components.
 */
import { Route, Routes } from 'react-router-dom'

import Home from '../pages/Home.jsx'
import ProductListing from '../pages/productListing.jsx'
import ProductDetails from '../pages/productDetails.jsx'
import Cart from '../pages/Cart.jsx'
import Checkout from '../pages/checkout.jsx'

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/products" element={<ProductListing />} />
			<Route path="/product/:id" element={<ProductDetails />} />
			<Route path="/cart" element={<Cart />} />
			<Route path="/checkout" element={<Checkout />} />
		</Routes>
	)
}

