import { IcustomRequest } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';


export const returnOnErrors = (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    // in case request params meet the validation criteria
    return next();
  }
  res.status(422).json({ err: errors.array(), success: false });
};
