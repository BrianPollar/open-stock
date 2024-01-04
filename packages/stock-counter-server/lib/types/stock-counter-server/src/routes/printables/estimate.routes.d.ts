import { TestimateStage } from '@open-stock/stock-universal';
/**
 * Updates the estimate with the specified ID and sets the stage and invoice ID.
 * @param estimateId - The ID of the estimate to update.
 * @param stage - The stage to set for the estimate.
 * @param queryId - The query ID associated with the estimate.
 * @param invoiceId - The invoice ID to set for the estimate (optional).
 * @returns A boolean indicating whether the estimate was successfully updated.
 */
export declare const updateEstimateUniv: (estimateId: number, stage: TestimateStage, queryId: string, invoiceId?: number) => Promise<boolean>;
/** Router for estimate routes */
export declare const estimateRoutes: any;
