import { TestimateStage } from '@open-stock/stock-universal';
export declare const updateEstimateUniv: (res: any, estimateId: number, stage: TestimateStage, companyId: string) => Promise<boolean>;
/** Router for estimate routes */
export declare const estimateRoutes: import("express-serve-static-core").Router;
