import { DatabaseAuto, IdeleteMany, Ifile, IfileMeta, IfilterProps, IinvoicePrintDetails, IinvoiceSetting, IinvoiceSettingsBank, IinvoiceSettingsGeneral, IinvoiceSettingsTax, Isuccess } from '@open-stock/stock-universal';
export declare class InvoiceSettings extends DatabaseAuto {
    generalSettings: IinvoiceSettingsGeneral;
    taxSettings: IinvoiceSettingsTax;
    bankSettings: IinvoiceSettingsBank;
    printDetails: IinvoicePrintDetails;
    /**
     * Creates an instance of InvoiceSettings.
     * @param {IinvoiceSetting} data - The data to initialize the instance with.
     */
    constructor(data: IinvoiceSetting);
    /**
     * Retrieves all invoice settings from the server, with optional pagination parameters for offset and limit.
  
     * @param {string} [url='getall'] - The URL to retrieve the invoice settings from.
     * @param {number} [offset=0] - The offset to start retrieving the invoice settings from.
     * @param {number} [limit=0] - The maximum number of invoice settings to retrieve.
     * @returns {Promise<InvoiceSettings[]>} An array of InvoiceSettings objects.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        invoiceSettings: InvoiceSettings[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        invoiceSettings: InvoiceSettings[];
    }>;
    /**
     * Retrieves a specific invoice settings object from the server based on its ID.
  
     * @param {string} id - The ID of the invoice settings object to retrieve.
     * @returns {Promise<InvoiceSettings>} A single InvoiceSettings object.
     */
    static getOne(_id: string): Promise<InvoiceSettings>;
    /**
     * Adds a new invoice settings object to the server.
  
     * @param {IinvoiceSetting} vals - The settings values to add.
     * @param {Ifile[]} [files] - Optional files for uploading digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
    static add(invoiceSetting: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes multiple invoice settings objects from the server based on their IDs.
  
     * @param {string[]} _ids - An array of IDs of the invoice settings objects to delete.
     * @returns {Promise<Isuccess>} A success message.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates an existing invoice settings object on the server.
  
     * @param {IinvoiceSetting} vals - The updated settings values.
     * @param {Ifile[]} [files] - Optional files for updating digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
    update(vals: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes images associated with an item.
     .
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    removeImages(where: 'signature' | 'stamp', filesWithDir: IfileMeta[]): Promise<Isuccess>;
}
