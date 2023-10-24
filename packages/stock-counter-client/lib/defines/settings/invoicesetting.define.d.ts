import { DatabaseAuto, Ifile, IinvoiceSetting, IinvoiceSettingsBank, IinvoiceSettingsGeneral, IinvoiceSettingsTax, Isuccess } from '@open-stock/stock-universal';
/** The  InvoiceSettings  class extends the  DatabaseAuto  class and represents a set of invoice settings. It has properties for general settings, tax settings, and bank settings, and a constructor that initializes these properties. */
export declare class InvoiceSettings extends DatabaseAuto {
    generalSettings: IinvoiceSettingsGeneral;
    taxSettings: IinvoiceSettingsTax;
    bankSettings: IinvoiceSettingsBank;
    constructor(data: IinvoiceSetting);
    /** getInvoiceSettings  retrieves all invoice settings from the server, with optional pagination parameters for offset and limit. It returns an array of  InvoiceSettings  objects.*/
    static getInvoiceSettings(url?: string, offset?: number, limit?: number): Promise<InvoiceSettings[]>;
    /** getOneInvoiceSettings  retrieves a specific invoice settings object from the server based on its ID. It returns a single  InvoiceSettings  object. */
    static getOneInvoiceSettings(id: string): Promise<InvoiceSettings>;
    /** addInvoiceSettings  adds a new invoice settings object to the server. It accepts the settings values as input, along with optional files for uploading digital signatures and stamps. It returns a success message.*/
    static addInvoiceSettings(vals: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
    /** deleteInvoiceSettings  deletes multiple invoice settings objects from the server based on their IDs. It accepts an array of IDs as input and returns a success message. */
    static deleteInvoiceSettings(ids: string[]): Promise<Isuccess>;
    /** updateInvoiceSettings  updates an existing invoice settings object on the server. It accepts the updated settings values as input, along with optional files for updating digital signatures and stamps. It returns a success message. */
    updateInvoiceSettings(vals: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
}
