/**
 * Creates a tourer cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The next middleware function.
 */
export declare const makeTourerCookie: (req: any, res: any, next: any) => any;
/**
 * Creates a settings cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and the stnCookie.
 */
export declare const makeSettingsCookie: (req: any, res: any) => any;
/**
 * Creates a cart cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
export declare const makeCartCookie: (req: any, res: any) => Promise<any>;
/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
export declare const makeRecentCookie: (req: any, res: any) => Promise<any>;
/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
export declare const makeWishListCookie: (req: any, res: any) => Promise<any>;
/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
export declare const makeCompareListCookie: (req: any, res: any) => Promise<any>;
