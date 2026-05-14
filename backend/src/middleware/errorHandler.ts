/**
 * Global error middleware.
 */

import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

interface CustomError extends Error {
	status?: number
}

function errorHandler(err: CustomError, _req: Request, res: Response, _next: NextFunction): void {
	const status = Number(err.status || 500)
	const message = err.message || 'Internal server error'

	res.status(status).json({
		ok: false,
		message,
		...(env.nodeEnv === 'development' ? { stack: err.stack } : {}),
	})
}

export { errorHandler }
