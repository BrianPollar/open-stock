"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceSettings = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
class InvoiceSettings extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.generalSettings = data.generalSettings;
        this.taxSettings = data.taxSettings;
        this.bankSettings = data.bankSettings;
        this.printDetails = data.printDetails;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicesettings/all/${offset}/${limit}`);
        const { count, data } = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count,
            invoiceSettings: data
                .map(val => new InvoiceSettings(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoicesettings/filter', filter);
        const { count, data } = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count,
            invoiceSettings: data
                .map(val => new InvoiceSettings(val))
        };
    }
    static async getOne(id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicesettings/one/${id}`);
        const invoiceSetting = await (0, rxjs_1.lastValueFrom)(observer$);
        return new InvoiceSettings(invoiceSetting);
    }
    static async add(invoiceSetting, files) {
        let added;
        const body = {
            invoiceSetting
        };
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/invoicesettings/add/img', body);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePost('/invoicesettings/add', body);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoicesettings/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async update(vals, files) {
        const body = {
            invoiceSetting: {
                ...vals,
                _id: this._id
            },
            filesWithDir: [{
                    filename: this.generalSettings?.defaultDigitalSignature
                },
                {
                    filename: this.generalSettings?.defaultDigitalStamp
                }
            ]
        };
        let added;
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/invoicesettings/update/img', body);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePut('/invoicesettings/update', body);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    async removeImages(where, filesWithDir) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoicesettings/delete/images', {
            filesWithDir,
            invoiceSetting: { _id: this._id }
        });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (deleted.success) {
            if (where === 'signature') {
                // eslint-disable-next-line no-undefined
                this.generalSettings.defaultDigitalSignature = undefined;
            }
            else {
                // eslint-disable-next-line no-undefined
                this.generalSettings.defaultDigitalStamp = undefined;
            }
        }
        return deleted;
    }
}
exports.InvoiceSettings = InvoiceSettings;
//# sourceMappingURL=invoicesetting.define.js.map