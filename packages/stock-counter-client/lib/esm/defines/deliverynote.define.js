import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export class DeliveryNote extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverynote/all/${offset}/${limit}`);
        const deliverynotes = await lastValueFrom(observer$);
        return {
            count: deliverynotes.count,
            deliverynotes: deliverynotes.data
                .map((val) => new DeliveryNote(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverynote/filter', filter);
        const deliverynotes = await lastValueFrom(observer$);
        return {
            count: deliverynotes.count,
            deliverynotes: deliverynotes.data
                .map((val) => new DeliveryNote(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverynote/one/${urId}`);
        const deliverynote = await lastValueFrom(observer$);
        return new DeliveryNote(deliverynote);
    }
    static add(invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverynote/add', invoiceRelated);
        return lastValueFrom(observer$);
    }
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverynote/delete/many', val); // TODO with IdeleteMany
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=deliverynote.define.js.map