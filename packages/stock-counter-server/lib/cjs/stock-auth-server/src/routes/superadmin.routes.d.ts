import { IcustomRequest } from '@open-stock/stock-universal';
import express, { NextFunction, Response } from 'express';
/**
 * Router for super admin routes.
 */
export declare const superAdminRoutes: import("express-serve-static-core").Router;
export declare const requireSuperAdmin: (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => void | express.Response<any, Record<string, any>>;
