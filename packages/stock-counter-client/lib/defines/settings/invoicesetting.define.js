import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
/** The  InvoiceSettings  class extends the  DatabaseAuto  class and represents a set of invoice settings. It has properties for general settings, tax settings, and bank settings, and a constructor that initializes these properties. */
export class InvoiceSettings extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.generalSettings = data.generalSettings;
        this.taxSettings = data.taxSettings;
        this.bankSettings = data.bankSettings;
    }
    /** getInvoiceSettings  retrieves all invoice settings from the server, with optional pagination parameters for offset and limit. It returns an array of  InvoiceSettings  objects.*/
    static async getInvoiceSettings(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesettings/${url}/${offset}/${limit}`);
        const invoiceSettings = await lastValueFrom(observer$);
        return invoiceSettings
            .map(val => new InvoiceSettings(val));
    }
    /** getOneInvoiceSettings  retrieves a specific invoice settings object from the server based on its ID. It returns a single  InvoiceSettings  object. */
    static async getOneInvoiceSettings(id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesettings/getone/${id}`);
        const invoiceSetting = await lastValueFrom(observer$);
        return new InvoiceSettings(invoiceSetting);
    }
    /** addInvoiceSettings  adds a new invoice settings object to the server. It accepts the settings values as input, along with optional files for uploading digital signatures and stamps. It returns a success message.*/
    static async addInvoiceSettings(vals, files) {
        let added;
        const details = {
            invoicesettings: vals
        };
        if (files && files[0]) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/invoicesettings/createimg', details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost('/invoicesettings/create', details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /** deleteInvoiceSettings  deletes multiple invoice settings objects from the server based on their IDs. It accepts an array of IDs as input and returns a success message. */
    static deleteInvoiceSettings(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicesettings/deletemany', { ids });
        return lastValueFrom(observer$);
    }
    /** updateInvoiceSettings  updates an existing invoice settings object on the server. It accepts the updated settings values as input, along with optional files for updating digital signatures and stamps. It returns a success message. */
    async updateInvoiceSettings(vals, files) {
        console.log('0000000', this.generalSettings);
        const details = {
            invoicesettings: {
                ...vals,
                // eslint-disable-next-line @typescript-eslint/naming-convention
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
        console.log('11111111');
        let added;
        if (files && files[0]) {
            console.log('222222222');
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/invoicesettings/updateimg', details);
            added = await lastValueFrom(observer$);
        }
        else {
            console.log('okay going to posting');
            const observer$ = StockCounterClient.ehttp
                .makePut('/invoicesettings/update', details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
}
//# sourceMappingURL=invoicesetting.define.js.map