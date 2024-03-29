import { DatabaseAuto, IdataArrayResponse, IsalesReport, Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';

/**
 * The `SalesReport` class represents a sales report object.
 * It extends the `DatabaseAuto` class and adds properties specific to sales reports, such as `urId`, `totalAmount`, `date`, `estimates`, and `invoiceRelateds`.
 * The constructor takes a data object that implements the `IsalesReport` interface and initializes the class properties based on the data.
 */
export class SalesReport extends DatabaseAuto {
  urId: string;
  /** The user's company ID. */
  companyId: string;
  totalAmount: number;
  date: Date;
  estimates: Estimate[];
  invoiceRelateds: InvoiceRelatedWithReceipt[];

  constructor(data: IsalesReport) {
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
   * Retrieves multiple sales reports from the server.
   * @param companyId - The ID of the company
   * @param url Optional parameter for the URL of the request.
   * @param offset Optional parameter for the offset of the request.
   * @param limit Optional parameter for the limit of the request.
   * @returns An array of `SalesReport` instances.
   */
  static async getSalesReports(companyId: string, url = 'getall', offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/salesreport/${url}/${offset}/${limit}/${companyId}`);
    const salesreports = await lastValueFrom(observer$) as IdataArrayResponse;
    return {
      cousnt: salesreports.count,
      salesreports: salesreports.data.map((val) => new SalesReport(val as IsalesReport))
    };
  }

  /**
   * Retrieves a single sales report from the server.
   * @param companyId - The ID of the company
   * @param urId The ID of the report to retrieve.
   * @returns A `SalesReport` instance.
   */
  static async getOneSalesReport(companyId: string, urId: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/salesreport/getone/${urId}/${companyId}`);
    const salesreport = await lastValueFrom(observer$) as IsalesReport;
    return new SalesReport(salesreport);
  }

  /**
   * Adds a new sales report to the server.
   * @param companyId - The ID of the company
   * @param vals An object that represents the data of the new report.
   * @returns An `Isuccess` object.
   */
  static async addSalesReport(companyId: string, vals: IsalesReport) {
    const observer$ = StockCounterClient.ehttp.makePost(`/salesreport/create/${companyId}`, vals);
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple sales reports from the server.
   * @param companyId - The ID of the company
   * @param ids An array of IDs of the reports to delete.
   * @returns An `Isuccess` object.
   */
  static async deleteSalesReports(companyId: string, ids: string[]) {
    const observer$ = StockCounterClient.ehttp.makePut(`/salesreport/deletemany/${companyId}`, { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
