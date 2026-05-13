/**
 * Top-level route definitions for the app.
 * Maps URL paths to page components.
 */
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useCallback } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import PageTransition from '../components/PageTransition.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const Home = lazy(() => import('../pages/Home.jsx'))
const ProductListing = lazy(() => import('../pages/productListing.jsx'))
const ProductDetails = lazy(() => import('../pages/productDetails.jsx'))
const Cart = lazy(() => import('../pages/Cart.jsx'))
const Checkout = lazy(() => import('../pages/checkout.jsx'))
const AdminProducts = lazy(() => import('../admin/pages/AdminProducts.jsx'))
const AdminOrders = lazy(() => import('../admin/pages/AdminOrders.jsx'))
const AdminOrderDetails = lazy(() => import('../admin/pages/AdminOrderDetails.jsx'))
const AdminDashboard = lazy(() => import('../admin/pages/AdminDashboard.jsx'))
const Signup = lazy(() => import('../pages/signup.jsx'))
const Login = lazy(() => import('../pages/login.jsx'))
const Logout = lazy(() => import('../pages/logout.jsx'))
const Orders = lazy(() => import('../pages/Orders.jsx'))
const Careers = lazy(() => import('../pages/careers.jsx'))
const Sustainability = lazy(() => import('../pages/sustainability.jsx'))
const Press = lazy(() => import('../pages/press.jsx'))
const About = lazy(() => import('../pages/about.jsx'))
const Contact = lazy(() => import('../pages/contact.jsx'))
const Shipping = lazy(() => import('../pages/shipping.jsx'))
const Returns = lazy(() => import('../pages/returns.jsx'))
const FAQ = lazy(() => import('../pages/faq.jsx'))
const GiftCards = lazy(() => import('../pages/giftcards.jsx'))

export default function AppRoutes() {
	const location = useLocation()
	const wrap = useCallback((node) => <PageTransition>{node}</PageTransition>, [])
	const withSuspense = useCallback((node) => <Suspense fallback={null}>{node}</Suspense>, [])

	return (
		<AnimatePresence mode="wait" initial={false}>
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={wrap(withSuspense(<Home />))} />
				<Route path="/products" element={wrap(withSuspense(<ProductListing />))} />
				<Route path="/product/:id" element={wrap(withSuspense(<ProductDetails />))} />
				<Route path="/cart" element={wrap(withSuspense(<Cart />))} />
				<Route
					path="/checkout"
					element={
						<ProtectedRoute>{wrap(withSuspense(<Checkout />))}</ProtectedRoute>
					}
				/>
				<Route path="/signup" element={wrap(withSuspense(<Signup />))} />
				<Route path="/login" element={wrap(withSuspense(<Login />))} />
				<Route path="/logout" element={wrap(withSuspense(<Logout />))} />
				<Route
					path="/orders"
					element={
						<ProtectedRoute>{wrap(withSuspense(<Orders />))}</ProtectedRoute>
					}
				/>
				<Route path="/careers" element={wrap(withSuspense(<Careers />))} />
				<Route path="/about" element={wrap(withSuspense(<About />))} />
				<Route path="/sustainability" element={wrap(withSuspense(<Sustainability />))} />
				<Route path="/press" element={wrap(withSuspense(<Press />))} />
				<Route path="/contact" element={wrap(withSuspense(<Contact />))} />
				<Route path="/shipping" element={wrap(withSuspense(<Shipping />))} />
				<Route path="/returns" element={wrap(withSuspense(<Returns />))} />
				<Route path="/faq" element={wrap(withSuspense(<FAQ />))} />
				<Route path="/giftcards" element={wrap(withSuspense(<GiftCards />))} />
				<Route
					path="/admin/dashboard"
					element={
						<ProtectedRoute requireAdmin>
							{wrap(withSuspense(<AdminDashboard />))}
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/products"
					element={
						<ProtectedRoute requireAdmin>
							{wrap(withSuspense(<AdminProducts />))}
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/orders"
					element={
						<ProtectedRoute requireAdmin>
							{wrap(withSuspense(<AdminOrders />))}
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/orders/:id"
					element={
						<ProtectedRoute requireAdmin>
							{wrap(withSuspense(<AdminOrderDetails />))}
						</ProtectedRoute>
					}
				/>
			</Routes>
		</AnimatePresence>
	)
}

