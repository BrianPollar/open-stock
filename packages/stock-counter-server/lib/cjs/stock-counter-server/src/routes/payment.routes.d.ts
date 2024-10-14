/**
 * Express router for payment routes.
 */
export declare const paymentRoutes: import("express-serve-static-core").Router;
export declare const updateInvoicerelatedStatus: (res: any, orderTrackingId: string) => Promise<{
    success: boolean;
    status: number;
    err: string;
} | {
    success: boolean;
}>;
export declare const updateCompanySubStatus: (res: any, orderTrackingId: string) => Promise<{
    success: boolean;
    status: number;
    err: string;
} | {
    success: boolean;
}>;
