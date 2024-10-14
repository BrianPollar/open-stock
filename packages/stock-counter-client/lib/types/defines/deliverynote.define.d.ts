import { IdeleteMany, IfilterProps, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export declare class DeliveryNote extends InvoiceRelatedWithReceipt {
    urId: string;
    companyId: string;
    constructor(data: any);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        deliverynotes: DeliveryNote[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        deliverynotes: DeliveryNote[];
    }>;
    static getOne(urIdOr_id: string): Promise<DeliveryNote>;
    static add(invoiceRelated: IinvoiceRelated): Promise<IsubscriptionFeatureState>;
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
