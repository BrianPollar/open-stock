"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceSettings = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
class InvoiceSettings extends stock_universal_1.DatabaseAuto {
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
  
     * @param {string} [url='getall'] - The URL to retrieve the invoice settings from.
     * @param {number} [offset=0] - The offset to start retrieving the invoice settings from.
     * @param {number} [limit=0] - The maximum number of invoice settings to retrieve.
     * @returns {Promise<InvoiceSettings[]>} An array of InvoiceSettings objects.
     */
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
    /**
     * Retrieves a specific invoice settings object from the server based on its ID.
  
     * @param {string} id - The ID of the invoice settings object to retrieve.
     * @returns {Promise<InvoiceSettings>} A single InvoiceSettings object.
     */
    static async getOne(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicesettings/one/${_id}`);
        const invoiceSetting = await (0, rxjs_1.lastValueFrom)(observer$);
        return new InvoiceSettings(invoiceSetting);
    }
    /**
     * Adds a new invoice settings object to the server.
  
     * @param {IinvoiceSetting} vals - The settings values to add.
     * @param {Ifile[]} [files] - Optional files for uploading digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
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
    /**
     * Deletes multiple invoice settings objects from the server based on their IDs.
  
     * @param {string[]} _ids - An array of IDs of the invoice settings objects to delete.
     * @returns {Promise<Isuccess>} A success message.
     */
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoicesettings/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates an existing invoice settings object on the server.
  
     * @param {IinvoiceSetting} vals - The updated settings values.
     * @param {Ifile[]} [files] - Optional files for updating digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
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
    /**
     * Deletes images associated with an item.
     .
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
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
                this.generalSettings.defaultDigitalSignature = null;
            }
            else {
                this.generalSettings.defaultDigitalStamp = null;
            }
        }
        return deleted;
    }
}
exports.InvoiceSettings = InvoiceSettings;
//# sourceMappingURL=invoicesetting.define.js.map