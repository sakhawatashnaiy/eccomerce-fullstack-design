import { Navigate } from 'react-router-dom'

export default function NewArrivals() {
	return <Navigate to="/products?sort=new" replace />
}
