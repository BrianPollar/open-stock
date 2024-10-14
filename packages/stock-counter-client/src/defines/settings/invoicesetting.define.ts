
import {
  DatabaseAuto,
  IdataArrayResponse,
  IdeleteMany,
  Ifile,
  IfileMeta,
  IfilterProps,
  IinvoicePrintDetails,
  IinvoiceSetting,
  IinvoiceSettingsBank,
  IinvoiceSettingsGeneral,
  IinvoiceSettingsTax,
  Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';

export class InvoiceSettings
  extends DatabaseAuto {
  generalSettings: IinvoiceSettingsGeneral;
  taxSettings: IinvoiceSettingsTax;
  bankSettings: IinvoiceSettingsBank;
  printDetails: IinvoicePrintDetails;

  constructor(data: IinvoiceSetting) {
    super(data);
    this.generalSettings = data.generalSettings;
    this.taxSettings = data.taxSettings;
    this.bankSettings = data.bankSettings;
    this.printDetails = data.printDetails;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IinvoiceSetting>>(`/invoicesettings/all/${offset}/${limit}`);
    const { count, data } = await lastValueFrom(observer$);

    return {
      count,
      invoiceSettings: data
        .map(val => new InvoiceSettings(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IinvoiceSetting>>('/invoicesettings/filter', filter);
    const { count, data } = await lastValueFrom(observer$);

    return {
      count,
      invoiceSettings: data
        .map(val => new InvoiceSettings(val))
    };
  }

  static async getOne(id: string): Promise<InvoiceSettings> {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IinvoiceSetting>(`/invoicesettings/one/${id}`);
    const invoiceSetting = await lastValueFrom(observer$);

    return new InvoiceSettings(invoiceSetting);
  }

  static async add(
    invoiceSetting: IinvoiceSetting,
    files?: Ifile[]
  ) {
    let added: Isuccess;
    const body = {
      invoiceSetting
    };

    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles<Isuccess>(
          files,
          '/invoicesettings/add/img',
          body
        );

      added = await lastValueFrom(observer$);
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePost<Isuccess>('/invoicesettings/add', body);

      added = await lastValueFrom(observer$);
    }

    return added;
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/invoicesettings/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async update(
    vals: IinvoiceSetting,
    files?: Ifile[]
  ) {
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
    let added: Isuccess;

    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles<Isuccess>(
          files,
          '/invoicesettings/update/img',
          body
        );

      added = await lastValueFrom(observer$);
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePut<Isuccess>('/invoicesettings/update', body);

      added = await lastValueFrom(observer$);
    }

    return added;
  }

  async removeImages(where: 'signature' | 'stamp', filesWithDir: IfileMeta[]) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/invoicesettings/delete/images', {
        filesWithDir,
        invoiceSetting: { _id: this._id }
      });
    const deleted = await lastValueFrom(observer$);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (deleted.success) {
      if (where === 'signature') {
        // eslint-disable-next-line no-undefined
        this.generalSettings.defaultDigitalSignature = undefined;
      } else {
        // eslint-disable-next-line no-undefined
        this.generalSettings.defaultDigitalStamp = undefined;
      }
    }

    return deleted;
  }
}


