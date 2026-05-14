/**
 * 404 middleware for unknown routes.
 */

import { Request, Response } from 'express'

function notFound(req: Request, res: Response): void {
	res.status(404).json({ ok: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export { notFound }
