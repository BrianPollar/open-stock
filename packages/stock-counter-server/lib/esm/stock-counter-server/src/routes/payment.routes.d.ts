import { Isuccess } from '@open-stock/stock-universal';
/**
 * Express router for payment routes.
 */
export declare const paymentRoutes: any;
export declare const updateInvoicerelatedStatus: (orderTrackingId: string) => Promise<Isuccess>;
export declare const updateCompanySubStatus: (orderTrackingId: string) => Promise<Isuccess>;
