import { IcustomRequest, Iuser } from '@open-stock/stock-universal';
import { Request, Response } from 'express';
/**
 * Express router for item routes.
 */
export declare const itemRoutes: import("express-serve-static-core").Router;
export declare const addReview: (req: Request, res: Response) => Promise<Response>;
export declare const removeReview: (req: IcustomRequest<never, {
    user: Iuser;
}>, res: Response) => Promise<Response>;
