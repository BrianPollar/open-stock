"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryNote = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const invoice_define_1 = require("./invoice.define");
class DeliveryNote extends invoice_define_1.InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverynote/all/${offset}/${limit}`);
        const deliverynotes = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: deliverynotes.count,
            deliverynotes: deliverynotes.data
                .map((val) => new DeliveryNote(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/deliverynote/filter', filter);
        const deliverynotes = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: deliverynotes.count,
            deliverynotes: deliverynotes.data
                .map((val) => new DeliveryNote(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverynote/one/${urIdOr_id}`);
        const deliverynote = await (0, rxjs_1.lastValueFrom)(observer$);
        return new DeliveryNote(deliverynote);
    }
    static add(invoiceRelated) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/deliverynote/add', invoiceRelated);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/deliverynote/delete/many', val); // TODO with IdeleteMany
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/deliverynote/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.DeliveryNote = DeliveryNote;
//# sourceMappingURL=deliverynote.define.js.map