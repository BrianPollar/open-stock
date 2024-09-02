import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
/** The  InvoiceSettings  class extends the  DatabaseAuto  class and represents a set of invoice settings. It has properties for general settings, tax settings, and bank settings, and a constructor that initializes these properties. */
/**
 * Represents the settings for an invoice.
 */
export class InvoiceSettings extends DatabaseAuto {
    /**
     * Creates an instance of InvoiceSettings.
     * @param {IinvoiceSetting} data - The data to initialize the instance with.
     */
    constructor(data) {
        super(data);
        this.generalSettings = data.generalSettings;
        this.taxSettings = data.taxSettings;
        this.bankSettings = data.bankSettings;
        this.printDetails = data.printDetails;
    }
    /**
     * Retrieves all invoice settings from the server, with optional pagination parameters for offset and limit.
     * @param companyId - The ID of the company
     * @param {string} [url='getall'] - The URL to retrieve the invoice settings from.
     * @param {number} [offset=0] - The offset to start retrieving the invoice settings from.
     * @param {number} [limit=0] - The maximum number of invoice settings to retrieve.
     * @returns {Promise<InvoiceSettings[]>} An array of InvoiceSettings objects.
     */
    static async getInvoiceSettings(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesettings/${url}/${offset}/${limit}/${companyId}`);
        const { count, data } = await lastValueFrom(observer$);
        return {
            count,
            invoiceSettings: data
                .map(val => new InvoiceSettings(val))
        };
    }
    /**
     * Retrieves a specific invoice settings object from the server based on its ID.
     * @param companyId - The ID of the company
     * @param {string} id - The ID of the invoice settings object to retrieve.
     * @returns {Promise<InvoiceSettings>} A single InvoiceSettings object.
     */
    static async getOneInvoiceSettings(companyId, id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesettings/getone/${id}/${companyId}`);
        const invoiceSetting = await lastValueFrom(observer$);
        return new InvoiceSettings(invoiceSetting);
    }
    /**
     * Adds a new invoice settings object to the server.
     * @param companyId - The ID of the company
     * @param {IinvoiceSetting} vals - The settings values to add.
     * @param {Ifile[]} [files] - Optional files for uploading digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
    static async addInvoiceSettings(companyId, vals, files) {
        let added;
        const details = {
            invoicesettings: vals
        };
        if (files && files[0]) {
            console.log('CREATING IMAFE');
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, `/invoicesettings/createimg/${companyId}`, details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost(`/invoicesettings/create/${companyId}`, details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /**
     * Deletes multiple invoice settings objects from the server based on their IDs.
     * @param companyId - The ID of the company
     * @param {string[]} ids - An array of IDs of the invoice settings objects to delete.
     * @returns {Promise<Isuccess>} A success message.
     */
    static deleteInvoiceSettings(companyId, ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/invoicesettings/deletemany/${companyId}`, { ids });
        return lastValueFrom(observer$);
    }
    /**
     * Updates an existing invoice settings object on the server.
     * @param companyId - The ID of the company
     * @param {IinvoiceSetting} vals - The updated settings values.
     * @param {Ifile[]} [files] - Optional files for updating digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
    async updateInvoiceSettings(companyId, vals, files) {
        const details = {
            invoicesettings: {
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
                .uploadFiles(files, `/invoicesettings/updateimg/${companyId}`, details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut(`/invoicesettings/update/${companyId}`, details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /**
     * Deletes images associated with an item.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    async deleteImages(companyId, where, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/invoicesettings/deleteimages/${companyId}`, { filesWithDir, item: { _id: this._id } });
        const deleted = await lastValueFrom(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (deleted.success) {
            if (where === 'signature') {
                this.generalSettings.defaultDigitalSignature = null;
            }
            else {
                this.generalSettings.defaultDigitalStamp = null;
            }
        }
        return deleted;
    }
}
//# sourceMappingURL=invoicesetting.define.js.map