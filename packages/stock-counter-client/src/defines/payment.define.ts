import {
  Iaddress, Ibilling,
  IcreateOrder,
  IdataArrayResponse,
  IdeleteMany,
  IfilterProps, Ipayment, IpaymentRelated, Isuccess,
  IupdatePay,
  TpaymentMethod
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';

export class PaymentRelated
  extends InvoiceRelatedWithReceipt {
  paymentRelated: string;
  urId: string;
  companyId: string;
  orderDate: Date;
  paymentDate: Date;
  billingAddress: Ibilling;
  shippingAddress: Iaddress;
  override readonly currency: string;
  user;
  isBurgain: boolean;
  shipping: number;
  manuallyAdded: boolean;
  paymentMethod: TpaymentMethod;
  orderDeliveryCode: string;

  constructor(data: Required<IpaymentRelated>) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.paymentRelated = data.paymentRelated;
    this.creationType = data.creationType;
    this.orderDate = data.orderDate;
    this.paymentDate = data.paymentDate;
    this.billingAddress = data.billingAddress;
    this.shippingAddress = data.shippingAddress;
    this.tax = data.tax;
    this.currency = data.currency;
    this.isBurgain = data.isBurgain;
    this.shipping = data.shipping;
    this.manuallyAdded = data.manuallyAdded;
    this.status = data.status;
    this.paymentMethod = data.paymentMethod;
    this.orderDeliveryCode = data.orderDeliveryCode;
  }
}


export class Payment extends PaymentRelated {
  order: string;

  constructor(data: Required<Ipayment>) {
    super(data);
    this.order = data.order as string;
  }

  static add(vals: IcreateOrder) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/payment/add', vals);

    return lastValueFrom(observer$);
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Required<Ipayment>>>(`/payment/all/${offset}/${limit}`);
    const payments = await lastValueFrom(observer$);

    return {
      count: payments.count,
      payments: payments.data.map(val => new Payment(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Required<Ipayment>>>('/payment/filter', filter);
    const payments = await lastValueFrom(observer$);

    return {
      count: payments.count,
      payments: payments.data.map(val => new Payment(val))
    };
  }

  static async getOne(id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Required<Ipayment>>(`/payment/one/${id}`);
    const payment = await lastValueFrom(observer$);

    return new Payment(payment);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/payment/delete/many', vals);

    return lastValueFrom(observer$);
  }

  update(vals: IupdatePay) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/payment/update', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp.makeDelete<Isuccess>(`/payment/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}

