import { lastValueFrom } from 'rxjs';
import { Estimate } from '../estimate.define';
import { DatabaseAuto, IsalesReport, Isuccess } from '@open-stock/stock-universal';
import { StockCounterClient } from '../../stock-counter-client';
import { InvoiceRelatedWithReceipt } from '../invoice.define';

/**
 * The `SalesReport` class represents a sales report object.
 * It extends the `DatabaseAuto` class and adds properties specific to sales reports, such as `urId`, `totalAmount`, `date`, `estimates`, and `invoiceRelateds`.
 * The constructor takes a data object that implements the `IsalesReport` interface and initializes the class properties based on the data.
 */
export class SalesReport extends DatabaseAuto {
  urId: string;
  totalAmount: number;
  date: Date;
  estimates: Estimate[];
  invoiceRelateds: InvoiceRelatedWithReceipt[];

  constructor(data: IsalesReport) {
    super(data);
    this.urId = data.urId ;
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
   * @param url Optional parameter for the URL of the request.
   * @param offset Optional parameter for the offset of the request.
   * @param limit Optional parameter for the limit of the request.
   * @returns An array of `SalesReport` instances.
   */
  static async getSalesReports(url = 'getall', offset = 0, limit = 0) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/salesreport/${url}/${offset}/${limit}`);
    const salesreports = await lastValueFrom(observer$) as IsalesReport[];
    return salesreports.map((val) => new SalesReport(val));
  }

  /**
   * Retrieves a single sales report from the server.
   * @param urId The ID of the report to retrieve.
   * @returns A `SalesReport` instance.
   */
  static async getOneSalesReport(urId: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/salesreport/getone/${urId}`);
    const salesreport = await lastValueFrom(observer$) as IsalesReport;
    return new SalesReport(salesreport);
  }

  /**
   * Adds a new sales report to the server.
   * @param vals An object that represents the data of the new report.
   * @returns An `Isuccess` object.
   */
  static async addSalesReport(vals: IsalesReport) {
    const observer$ = StockCounterClient.ehttp.makePost('/salesreport/create', vals);
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple sales reports from the server.
   * @param ids An array of IDs of the reports to delete.
   * @returns An `Isuccess` object.
   */
  static async deleteSalesReports(ids: string[]) {
    const observer$ = StockCounterClient.ehttp.makePut('/salesreport/deletemany', { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
