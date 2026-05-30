/**
 * Firebase auth guard middleware.
 * Expects `Authorization: Bearer <idToken>` and attaches decoded user to `req.user`.
 */
import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
}
declare function authGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void>;
export { authGuard };
//# sourceMappingURL=authGuard.d.ts.map