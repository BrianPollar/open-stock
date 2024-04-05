import { TsubscriptionFeature } from '@open-stock/stock-universal';
export declare const requireCanUseFeature: (feature: TsubscriptionFeature) => (req: any, res: any, next: any) => Promise<any>;
export declare const requireActiveCompany: (req: any, res: any, next: any) => any;
export declare const requireUpdateSubscriptionRecord: (feature: TsubscriptionFeature) => (req: any, res: any) => Promise<any>;
