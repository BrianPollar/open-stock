import { DatabaseAuto, Ifile, IinvoiceSetting, IinvoiceSettingsBank, IinvoiceSettingsGeneral, IinvoiceSettingsTax, Isuccess } from '@open-stock/stock-universal';
/** The  InvoiceSettings  class extends the  DatabaseAuto  class and represents a set of invoice settings. It has properties for general settings, tax settings, and bank settings, and a constructor that initializes these properties. */
/**
 * Represents the settings for an invoice.
 */
export declare class InvoiceSettings extends DatabaseAuto {
    generalSettings: IinvoiceSettingsGeneral;
    taxSettings: IinvoiceSettingsTax;
    bankSettings: IinvoiceSettingsBank;
    /**
     * Creates an instance of InvoiceSettings.
     * @param {IinvoiceSetting} data - The data to initialize the instance with.
     */
    constructor(data: IinvoiceSetting);
    /**
     * Retrieves all invoice settings from the server, with optional pagination parameters for offset and limit.
     * @param companyId - The ID of the company
     * @param {string} [url='getall'] - The URL to retrieve the invoice settings from.
     * @param {number} [offset=0] - The offset to start retrieving the invoice settings from.
     * @param {number} [limit=0] - The maximum number of invoice settings to retrieve.
     * @returns {Promise<InvoiceSettings[]>} An array of InvoiceSettings objects.
     */
    static getInvoiceSettings(companyId: string, url?: string, offset?: number, limit?: number): Promise<InvoiceSettings[]>;
    /**
     * Retrieves a specific invoice settings object from the server based on its ID.
     * @param companyId - The ID of the company
     * @param {string} id - The ID of the invoice settings object to retrieve.
     * @returns {Promise<InvoiceSettings>} A single InvoiceSettings object.
     */
    static getOneInvoiceSettings(companyId: string, id: string): Promise<InvoiceSettings>;
    /**
     * Adds a new invoice settings object to the server.
     * @param companyId - The ID of the company
     * @param {IinvoiceSetting} vals - The settings values to add.
     * @param {Ifile[]} [files] - Optional files for uploading digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
    static addInvoiceSettings(companyId: string, vals: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes multiple invoice settings objects from the server based on their IDs.
     * @param companyId - The ID of the company
     * @param {string[]} ids - An array of IDs of the invoice settings objects to delete.
     * @returns {Promise<Isuccess>} A success message.
     */
    static deleteInvoiceSettings(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Updates an existing invoice settings object on the server.
     * @param companyId - The ID of the company
     * @param {IinvoiceSetting} vals - The updated settings values.
     * @param {Ifile[]} [files] - Optional files for updating digital signatures and stamps.
     * @returns {Promise<Isuccess>} A success message.
     */
    updateInvoiceSettings(companyId: string, vals: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
}
