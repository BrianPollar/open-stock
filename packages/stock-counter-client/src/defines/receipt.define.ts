import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany,
  IeditReceipt,
  IfilterProps, IinvoiceRelated,
  IinvoiceRelatedPdct,
  Ireceipt, Isuccess, TestimateStage,
  TinvoiceStatus,
  TinvoiceType,
  TreceiptType
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

export class InvoiceRelated
  extends DatabaseAuto {
  invoiceRelated: string;
  creationType: TinvoiceType;
  estimateId: number;
  invoiceId: number;
  billingUser: string;
  extraCompanyDetails: string;
  items: IinvoiceRelatedPdct[];
  billingUserId: string;
  billingUserPhoto: string;
  stage: TestimateStage;
  status: TinvoiceStatus;
  cost: number;
  paymentMade: number;
  tax: number;
  balanceDue: number;
  subTotal: number;
  total: number;
  fromDate: Date;
  toDate: Date;
  ecommerceSale = false;
  ecommerceSalePercentage = 0;
  readonly currency: string;

  constructor(data: Required<IinvoiceRelated>) {
    super(data);
    this.invoiceRelated = data.invoiceRelated;
    this.creationType = data.creationType;
    this.invoiceId = data.invoiceId;
    this.billingUser = data.billingUser;
    this.extraCompanyDetails = data.extraCompanyDetails;
    this.items = data.items;
    this.billingUserId = data.billingUserId;
    this.billingUserPhoto = data.billingUserPhoto;
    this.stage = data.stage;
    this.estimateId = data.estimateId;
    this.status = data.status;
    this.cost = data.cost;
    this.tax = data.tax;
    this.balanceDue = data.balanceDue;
    this.subTotal = data.subTotal;
    this.total = data.total;
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.ecommerceSale = data.ecommerceSale || false;
    this.ecommerceSalePercentage = data.ecommerceSalePercentage || 0;
    this.currency = data.currency;
  }

  static addInvoicePayment(payment: Ireceipt) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/invoice/createpayment', payment);

    return lastValueFrom(observer$);
  }

  static updateInvoiceRelated(invoiceRelated: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/invoicerelated/update', invoiceRelated);

    return lastValueFrom(observer$);
  }
}


export class Receipt
  extends InvoiceRelated {
  urId: string;
  companyId: string;
  amountRcievd: number;
  paymentMode: string;
  type: TreceiptType;
  paymentInstall: string;
  date: Date;
  amount: number;

  constructor(data: Required<Ireceipt>) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.amountRcievd = data.amountRcievd;
    this.paymentMode = data.paymentMode;
    this.type = data.type;
    this.date = data.toDate;
    this.amount = data.amount;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Required<Ireceipt>>>(`/receipt/all/${offset}/${limit}`);
    const receipts = await lastValueFrom(observer$);

    return {
      count: receipts.count,
      receipts: receipts.data
        .map(val => new Receipt(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Required<Ireceipt>>>('/receipt/filter', filter);
    const receipts = await lastValueFrom(observer$);

    return {
      count: receipts.count,
      receipts: receipts.data
        .map(val => new Receipt(val))
    };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Required<Ireceipt>>(`/receipt/one/${urIdOr_id}`);
    const receipt = await lastValueFrom(observer$);

    return new Receipt(receipt);
  }

  static add(vals: IeditReceipt) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/receipt/create', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(val: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/receipt/delete/many', val);

    return lastValueFrom(observer$);
  }

  update(vals: IeditReceipt) {
    vals.receipt._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/receipt/update', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/receipt/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
