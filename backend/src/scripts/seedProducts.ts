/**
 * Seeds Firestore `products` collection with sample data.
 * Requires FIREBASE_SERVICE_ACCOUNT in environment.
 */

require('dotenv').config()

const { seedProductCollection } = require('../modules/products/products.service')

async function run() {
	try {
		const result = await seedProductCollection()
		console.log(`Seed complete: ${result.inserted} products inserted/updated.`)
		process.exit(0)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error('Seed failed:', message)
		process.exit(1)
	}
}

run()
