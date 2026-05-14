/**
 * Role-based access control (RBAC) middleware.
 *
 * Requires `authGuard` to have already populated `req.user`.
 *
 * Role sources (combined):
 * - Firebase custom claim: `admin === true` (adds role: admin)
 * - Env allowlist: ADMIN_UIDS / ADMIN_EMAILS (adds role: admin)
 * - Firebase custom claims: `role` (string) or `roles` (string[])
 * - Firestore user profile: `role` (string)
 */

import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { findOrCreateUserProfile } from '../modules/auth/auth.service'

interface CustomError extends Error {
	status?: number
}

interface AuthenticatedRequest extends Request {
	user?: any
	userProfile?: any
	params: Record<string, string>
}

function normalizeRole(value: any): string {
	return String(value || '').trim().toLowerCase()
}

function parseCsv(value: string): string[] {
	return String(value || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
}

function isAllowlisted({ uid, email }: { uid?: string; email?: string }): boolean {
	const allowedUids = new Set(parseCsv(env.adminUids))
	const allowedEmails = new Set(parseCsv(env.adminEmails).map((e) => e.toLowerCase()))

	if (uid && allowedUids.has(String(uid))) return true
	if (email && allowedEmails.has(String(email).toLowerCase())) return true
	return false
}

function addRole(roleSet: Set<string>, role: any): void {
	const normalized = normalizeRole(role)
	if (normalized) roleSet.add(normalized)
}

function getRolesFromDecoded(decoded: any): Set<string> {
	const roles = new Set<string>()

	if (decoded?.admin === true) roles.add('admin')
	if (isAllowlisted({ uid: decoded?.uid, email: decoded?.email })) roles.add('admin')

	if (typeof decoded?.role === 'string') addRole(roles, decoded.role)
	if (Array.isArray(decoded?.roles)) {
		for (const r of decoded.roles) addRole(roles, r)
	}

	return roles
}

function hasAnyRole(roleSet: Set<string>, allowedRoles: string[]): boolean {
	for (const r of allowedRoles) {
		if (roleSet.has(normalizeRole(r))) return true
	}
	return false
}

function requireRoles(roles: string[] | string = []): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void> {
	const allowed = Array.isArray(roles) ? roles : [roles]

	return async function roleGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
		try {
			const decoded = req.user
			if (!decoded?.uid) {
				const error: CustomError = new Error('Unauthorized')
				error.status = 401
				throw error
			}

			if (allowed.length === 0) return next()

			const roleSet = getRolesFromDecoded(decoded)
			if (hasAnyRole(roleSet, allowed)) return next()

			// Only hit Firestore if we need it to decide.
			const profile = await findOrCreateUserProfile(decoded)
			req.userProfile = profile
			addRole(roleSet, profile?.role)

			if (hasAnyRole(roleSet, allowed)) return next()

			const error: CustomError = new Error('Forbidden')
			error.status = 403
			throw error
		} catch (error: any) {
			error.status = error.status || 403
			next(error)
		}
	}
}

interface SelfOrRolesOptions {
	param?: string
	roles?: string[] | string
}

function requireSelfOrRoles({ param = 'uid', roles = ['admin'] }: SelfOrRolesOptions = {}): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void> {
	const allowed = Array.isArray(roles) ? roles : [roles]
	const requireOther = requireRoles(allowed)

	return async function selfOrRolesGuard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
		const decoded = req.user
		if (!decoded?.uid) {
			const error: CustomError = new Error('Unauthorized')
			error.status = 401
			return next(error)
		}

		if (String(req.params?.[param] || '') === String(decoded.uid)) return next()
		return requireOther(req, res, next)
	}
}

export { requireRoles, requireSelfOrRoles }
