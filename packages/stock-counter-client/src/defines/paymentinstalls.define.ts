/** import { DatabaseAuto, IpaymentInstall, Isuccess, TpaymentInstallType } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

/** */
/* export class PaymentInstall
  extends DatabaseAuto {
  urId: string;
  amount: number;
  date: Date;
  type: TpaymentInstallType;
  relatedId: string;
  receiptId: string;

  constructor(
    data: IpaymentInstall
  ) {
    super(data);
    this.amount = data.amount;
    this.date = data.date;
    this.type = data.type;
    this.relatedId = data.relatedId;
    this.receiptId = data.receiptId;
  }

  /** */
/* static async getPaymentInstalls(
    url = 'getall',
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/paymentinstalls/${url}/${offset}/${limit}`);
    const pInstalls = await lastValueFrom(observer$) as IpaymentInstall[];
    return pInstalls.map(val => new PaymentInstall(val));
  }

  /** */
/* static async getOnePayment(
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/paymentinstalls/getone/${id}`);
    const pInstall = await lastValueFrom(observer$) as IpaymentInstall;
    return new PaymentInstall(pInstall);
  }

  /** */
/* static async deletePayments(
    ids: string[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/paymentinstalls/deletemany', { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /** */
/* async deletePayment() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete(`/paymentinstalls/deleteone/${this._id}`);
    return await lastValueFrom(observer$) as Isuccess;
  }
}
*/
