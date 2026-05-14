/**
 * Wraps async route handlers and forwards errors to Express error middleware.
 */

import { Request, Response, NextFunction } from 'express'

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>

function asyncHandler(handler: AsyncHandler) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(handler(req, res, next)).catch(next)
	}
}

export { asyncHandler }
