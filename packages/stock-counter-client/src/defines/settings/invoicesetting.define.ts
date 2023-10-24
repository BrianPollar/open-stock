
import {
  DatabaseAuto,
  Ifile,
  IinvoiceSetting,
  IinvoiceSettingsBank,
  IinvoiceSettingsGeneral,
  IinvoiceSettingsTax,
  Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';

/** The  InvoiceSettings  class extends the  DatabaseAuto  class and represents a set of invoice settings. It has properties for general settings, tax settings, and bank settings, and a constructor that initializes these properties. */
/**
 * Represents the settings for an invoice.
 */
export class InvoiceSettings extends DatabaseAuto {
  generalSettings: IinvoiceSettingsGeneral;
  taxSettings: IinvoiceSettingsTax;
  bankSettings: IinvoiceSettingsBank;

  /**
   * Creates an instance of InvoiceSettings.
   * @param {IinvoiceSetting} data - The data to initialize the instance with.
   */
  constructor(data: IinvoiceSetting) {
    super(data);
    this.generalSettings = data.generalSettings;
    this.taxSettings = data.taxSettings;
    this.bankSettings = data.bankSettings;
  }

  /**
   * Retrieves all invoice settings from the server, with optional pagination parameters for offset and limit.
   * @param {string} [url='getall'] - The URL to retrieve the invoice settings from.
   * @param {number} [offset=0] - The offset to start retrieving the invoice settings from.
   * @param {number} [limit=0] - The maximum number of invoice settings to retrieve.
   * @returns {Promise<InvoiceSettings[]>} An array of InvoiceSettings objects.
   */
  static async getInvoiceSettings(
    url = 'getall',
    offset = 0,
    limit = 0
  ): Promise<InvoiceSettings[]> {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoicesettings/${url}/${offset}/${limit}`);
    const invoiceSettings = await lastValueFrom(observer$) as IinvoiceSetting[];
    return invoiceSettings
      .map(val => new InvoiceSettings(val));
  }

  /**
   * Retrieves a specific invoice settings object from the server based on its ID.
   * @param {string} id - The ID of the invoice settings object to retrieve.
   * @returns {Promise<InvoiceSettings>} A single InvoiceSettings object.
   */
  static async getOneInvoiceSettings(
    id: string
  ): Promise<InvoiceSettings> {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoicesettings/getone/${id}`);
    const invoiceSetting = await lastValueFrom(observer$) as IinvoiceSetting;
    return new InvoiceSettings(invoiceSetting);
  }

  /**
   * Adds a new invoice settings object to the server.
   * @param {IinvoiceSetting} vals - The settings values to add.
   * @param {Ifile[]} [files] - Optional files for uploading digital signatures and stamps.
   * @returns {Promise<Isuccess>} A success message.
   */
  static async addInvoiceSettings(
    vals: IinvoiceSetting,
    files?: Ifile[]
  ): Promise<Isuccess> {
    let added: Isuccess;
    const details = {
      invoicesettings: vals
    };
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles(files,
          '/invoicesettings/createimg',
          details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePost('/invoicesettings/create', details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }

  /**
   * Deletes multiple invoice settings objects from the server based on their IDs.
   * @param {string[]} ids - An array of IDs of the invoice settings objects to delete.
   * @returns {Promise<Isuccess>} A success message.
   */
  static deleteInvoiceSettings(
    ids: string[]
  ): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp
      .makePut('/invoicesettings/deletemany', { ids });
    return lastValueFrom(observer$) as Promise<Isuccess>;
  }

  /**
   * Updates an existing invoice settings object on the server.
   * @param {IinvoiceSetting} vals - The updated settings values.
   * @param {Ifile[]} [files] - Optional files for updating digital signatures and stamps.
   * @returns {Promise<Isuccess>} A success message.
   */
  async updateInvoiceSettings(
    vals: IinvoiceSetting,
    files?: Ifile[]
  ): Promise<Isuccess> {
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
    let added: Isuccess;
    if (files && files[0]) {
      console.log('222222222');
      const observer$ = StockCounterClient.ehttp
        .uploadFiles(files,
          '/invoicesettings/updateimg',
          details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      console.log('okay going to posting');
      const observer$ = StockCounterClient.ehttp
        .makePut('/invoicesettings/update', details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }
}


