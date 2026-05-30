/**
 * Express app setup.
 * Registers middleware, API routes, and global error handlers.
 */
import type { Request, Response } from 'express'

const express = require('express')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')

const apiRouter = require('./routes')
const { notFound } = require('./middleware/notFound')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use(morgan('dev'))

app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ ok: true, message: 'API is healthy' })
})

app.use('/api/v1', apiRouter)

if (process.env.NODE_ENV === 'production') {
	const clientBuildPath = path.join(__dirname, '../../frontend/dist')
	app.use(express.static(clientBuildPath))

	app.get('*', (_req: Request, res: Response) => {
		res.sendFile(path.join(clientBuildPath, 'index.html'))
	})
}

app.use(notFound)
app.use(errorHandler)

module.exports = app

export {}
