import { Navigate } from 'react-router-dom'

export default function Wishlist() {
	return <Navigate to="/products?wishlist=true" replace />
}
