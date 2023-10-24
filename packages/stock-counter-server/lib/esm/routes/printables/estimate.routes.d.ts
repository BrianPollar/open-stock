import { TestimateStage } from '@open-stock/stock-universal';
/**
 * Updates an estimate's stage and/or invoice ID.
 * @param estimateId The ID of the estimate to update.
 * @param stage The new stage for the estimate.
 * @param invoiceId (Optional) The new invoice ID for the estimate.
 * @returns True if the update was successful, false otherwise.
 */
export declare const updateEstimateUniv: (estimateId: number, stage: TestimateStage, invoiceId?: number) => Promise<boolean>;
/** Router for estimate routes */
export declare const estimateRoutes: any;
