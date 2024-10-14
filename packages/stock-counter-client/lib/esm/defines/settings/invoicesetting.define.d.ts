import { DatabaseAuto, IdeleteMany, Ifile, IfileMeta, IfilterProps, IinvoicePrintDetails, IinvoiceSetting, IinvoiceSettingsBank, IinvoiceSettingsGeneral, IinvoiceSettingsTax, Isuccess } from '@open-stock/stock-universal';
export declare class InvoiceSettings extends DatabaseAuto {
    generalSettings: IinvoiceSettingsGeneral;
    taxSettings: IinvoiceSettingsTax;
    bankSettings: IinvoiceSettingsBank;
    printDetails: IinvoicePrintDetails;
    constructor(data: IinvoiceSetting);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        invoiceSettings: InvoiceSettings[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        invoiceSettings: InvoiceSettings[];
    }>;
    static getOne(id: string): Promise<InvoiceSettings>;
    static add(invoiceSetting: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: IinvoiceSetting, files?: Ifile[]): Promise<Isuccess>;
    removeImages(where: 'signature' | 'stamp', filesWithDir: IfileMeta[]): Promise<Isuccess>;
}
