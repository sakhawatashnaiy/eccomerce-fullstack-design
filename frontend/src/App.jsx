/**
 * Root React component for the frontend app.
 * Wraps the route tree with React Router's `BrowserRouter`.
 */
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'

export default function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	)
}



