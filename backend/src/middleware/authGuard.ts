/**
 * Firebase auth guard middleware.
 * Expects `Authorization: Bearer <idToken>` and attaches decoded user to `req.user`.
 */

import { Request, Response, NextFunction } from 'express'
import { getFirebaseAdmin } from '../config/firebaseAdmin'

interface CustomError extends Error {
	status?: number
}

interface AuthenticatedRequest extends Request {
	user?: any
}

async function authGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
	try {
		const authHeader = req.headers.authorization || ''
		if (!authHeader.startsWith('Bearer ')) {
			const error: CustomError = new Error('Missing or invalid authorization token')
			error.status = 401
			throw error
		}

		const token = authHeader.slice(7)
		const { auth } = getFirebaseAdmin()
		const decoded = await auth.verifyIdToken(token)
		req.user = decoded
		next()
	} catch (error: any) {
		error.status = error.status || 401
		next(error)
	}
}

export { authGuard }
