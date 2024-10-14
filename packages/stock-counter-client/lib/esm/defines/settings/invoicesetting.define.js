import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
export class InvoiceSettings extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.generalSettings = data.generalSettings;
        this.taxSettings = data.taxSettings;
        this.bankSettings = data.bankSettings;
        this.printDetails = data.printDetails;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesettings/all/${offset}/${limit}`);
        const { count, data } = await lastValueFrom(observer$);
        return {
            count,
            invoiceSettings: data
                .map(val => new InvoiceSettings(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicesettings/filter', filter);
        const { count, data } = await lastValueFrom(observer$);
        return {
            count,
            invoiceSettings: data
                .map(val => new InvoiceSettings(val))
        };
    }
    static async getOne(id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesettings/one/${id}`);
        const invoiceSetting = await lastValueFrom(observer$);
        return new InvoiceSettings(invoiceSetting);
    }
    static async add(invoiceSetting, files) {
        let added;
        const body = {
            invoiceSetting
        };
        if (files && files[0]) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/invoicesettings/add/img', body);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost('/invoicesettings/add', body);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicesettings/delete/many', vals);
        return lastValueFrom(observer$);
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
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/invoicesettings/update/img', body);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut('/invoicesettings/update', body);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    async removeImages(where, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicesettings/delete/images', {
            filesWithDir,
            invoiceSetting: { _id: this._id }
        });
        const deleted = await lastValueFrom(observer$);
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
//# sourceMappingURL=invoicesetting.define.js.map