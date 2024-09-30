import { IcustomRequest } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
export declare const returnOnValidationErrors: (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => void;
