/**
 * Global error middleware.
 */
import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    status?: number;
}
declare function errorHandler(err: CustomError, _req: Request, res: Response, _next: NextFunction): void;
export { errorHandler };
//# sourceMappingURL=errorHandler.d.ts.map