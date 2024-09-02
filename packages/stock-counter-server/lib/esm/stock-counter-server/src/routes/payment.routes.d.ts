import { Isuccess } from '@open-stock/stock-universal';
/**
 * Express router for payment routes.
 */
export declare const paymentRoutes: any;
export declare const updateInvoicerelatedStatus: (res: any, orderTrackingId: string) => Promise<Isuccess>;
export declare const updateCompanySubStatus: (res: any, orderTrackingId: string) => Promise<Isuccess>;
