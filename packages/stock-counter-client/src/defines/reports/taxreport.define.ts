import { DatabaseAuto, IdataArrayResponse, Isuccess, ItaxReport } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';

/**
 * TaxReport class: This class represents a tax report object. It extends the DatabaseAuto class.
 */
export class TaxReport extends DatabaseAuto {
  /** A string representing the unique identifier of the tax report. */
  urId: string;
  /** The user's company ID. */
  companyId: string;
  /** A number representing the total amount of the tax report. */
  totalAmount: number;
  /** A Date object representing the date of the tax report. */
  date: Date;
  /** An array of Estimate objects representing the estimates related to the tax report. */
  estimates: Estimate[];
  /** An array of InvoiceRelatedWithReceipt objects representing the invoice-related information of the tax report. */
  invoiceRelateds: InvoiceRelatedWithReceipt[];

  /**
   * TaxReport constructor: The constructor accepts an object (data) that implements the ItaxReport interface.
   * It initializes the properties of the TaxReport instance based on the provided data.
   * @param data An object that implements the ItaxReport interface.
   */
  constructor(data: ItaxReport) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.totalAmount = data.totalAmount;
    this.date = data.date;
    if (data.estimates) {
      this.estimates = data.estimates.map((val) => new Estimate(val));
    }
    if (data.invoiceRelateds) {
      this.invoiceRelateds = data.invoiceRelateds.map((val) => new InvoiceRelatedWithReceipt(val));
    }
  }

  /**
   * Retrieves multiple tax reports from the server.
   * @param companyId - The ID of the company
   * @param url Optional parameter for the URL of the request.
   * @param offset Optional parameter for the offset of the request.
   * @param limit Optional parameter for the limit of the request.
   * @returns An array of TaxReport instances.
   */
  static async getTaxReports(companyId: string, url = 'getall', offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/taxreport/${url}/${offset}/${limit}/${companyId}`);
    const taxreports = await lastValueFrom(observer$) as IdataArrayResponse;
    return {
      count: taxreports.count,
      taxreports: taxreports.data.map((val) => new TaxReport(val as ItaxReport))
    };
  }

  /**
   * Retrieves a single tax report from the server based on the provided unique identifier (urId).
   * @param companyId - The ID of the company
   * @param urId A string representing the unique identifier of the tax report.
   * @returns A TaxReport instance.
   */
  static async getOneTaxReport(companyId: string, urId: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/taxreport/getone/${urId}/${companyId}`);
    const taxreport = await lastValueFrom(observer$) as ItaxReport;
    return new TaxReport(taxreport);
  }

  /**
   * Adds a new tax report to the server.
   * @param companyId - The ID of the company
   * @param vals An object that implements the ItaxReport interface.
   * @returns A success response.
   */
  static async addTaxReport(companyId: string, vals: ItaxReport) {
    const observer$ = StockCounterClient.ehttp.makePost(`/taxreport/create/${companyId}`, vals);
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple tax reports from the server based on the provided array of unique identifiers (ids).
   * @param companyId - The ID of the company
   * @param ids An array of strings representing the unique identifiers of the tax reports to be deleted.
   * @returns A success response.
   */
  static async deleteTaxReports(companyId: string, ids: string[]) {
    const observer$ = StockCounterClient.ehttp.makePut(`/taxreport/deletemany/${companyId}`, { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
