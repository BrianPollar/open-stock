import { IcustomRequest } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
export declare const makeTourerCookie: (req: IcustomRequest<never, {
    tourer;
}>, res: Response, next: NextFunction) => void;
export declare const makeSettingsCookie: (req: IcustomRequest<never, {
    stnCookie;
}>, res: Response) => Response<any, Record<string, any>>;
export declare const makeCartCookie: (req: IcustomRequest<never, {
    cartItemId;
    cartCookie;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const makeRecentCookie: (req: IcustomRequest<never, {
    recentCookie;
    recentItemId;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const makeWishListCookie: (req: IcustomRequest<never, {
    wishListCookie;
    wishListItemId;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const makeCompareListCookie: (req: IcustomRequest<never, {
    compareListCookie;
    compareLisItemId;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
