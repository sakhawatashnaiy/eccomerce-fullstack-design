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
import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
    userProfile?: any;
    params: Record<string, string>;
}
declare function requireRoles(roles?: string[] | string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
interface SelfOrRolesOptions {
    param?: string;
    roles?: string[] | string;
}
declare function requireSelfOrRoles({ param, roles }?: SelfOrRolesOptions): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export { requireRoles, requireSelfOrRoles };
//# sourceMappingURL=roleGuard.d.ts.map