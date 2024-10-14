import { IcustomRequest, IeditCompany } from '@open-stock/stock-universal';
import express, { Response } from 'express';
/**
 * Router for company authentication routes.
 */
export declare const companyRoutes: import("express-serve-static-core").Router;
export declare const addCompany: (req: IcustomRequest<never, Partial<IeditCompany>>, res: Response) => Promise<express.Response<any, Record<string, any>>>;
export declare const updateCompany: (req: IcustomRequest<never, Partial<IeditCompany>>, res: Response) => Promise<express.Response<any, Record<string, any>>>;
