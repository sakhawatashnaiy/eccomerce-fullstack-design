/**
 * Wraps async route handlers and forwards errors to Express error middleware.
 */
import { Request, Response, NextFunction } from 'express';
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
declare function asyncHandler(handler: AsyncHandler): (req: Request, res: Response, next: NextFunction) => void;
export { asyncHandler };
//# sourceMappingURL=asyncHandler.d.ts.map