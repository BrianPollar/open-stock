import {
  Iaddress,
  Icustomer,
  IdataArrayResponse,
  IdeleteMany, IeditCustomer,
  Ifile, IfilterProps,
  IsubscriptionFeatureState,
  Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';

interface IgetOneFilter {
  _id?: string;
  userId?: string;
  companyId?: string;
  urId?: string;
}

export class Customer
  extends UserBase {
  otherAddresses?: Iaddress[];

  constructor(data: Icustomer) {
    super(data);
    this.otherAddresses = data.otherAddresses;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Icustomer>>(`/customer/all/${offset}/${limit}`);
    const customers = await lastValueFrom(observer$);

    return {
      count: customers.count,
      customers: customers.data.map(val => new Customer(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient
      .ehttp.makePost<IdataArrayResponse<Icustomer>>('/customer/filter', filter);
    const customers = await lastValueFrom(observer$);

    return {
      count: customers.count,
      customers: customers.data.map(val => new Customer(val))
    };
  }

  static async getOne(filter: IgetOneFilter): Promise<Customer> {
    const observer$ = StockCounterClient
      .ehttp.makePost<Icustomer>('/customer/one', filter);
    const customer = await lastValueFrom(observer$);

    return new Customer(customer);
  }

  static async add(vals: IeditCustomer, files?: Ifile[]) {
    let added: IsubscriptionFeatureState;

    vals.user.userType = 'customer';
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles<IsubscriptionFeatureState>(files, '/customer/add/img', vals);

      added = await lastValueFrom(observer$);
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePost<IsubscriptionFeatureState>('/customer/add', vals);

      added = await lastValueFrom(observer$);
    }

    return added;
  }

  static removeMany(val: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/customer/delete/many', val);

    return lastValueFrom(observer$);
  }

  async update(vals: IeditCustomer, files?: Ifile[]) {
    let updated: Isuccess;

    vals.customer._id = this._id;
    vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles<Isuccess>(files, '/customer/update/img', vals);

      updated = await lastValueFrom(observer$);
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePut<Isuccess>('/customer/update', vals);

      updated = await lastValueFrom(observer$);
    }

    if (updated.success) {
      this.otherAddresses = vals.customer.otherAddresses || this.otherAddresses;
    }

    return updated;
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/customer/delete/one', { _id: this._id });

    return lastValueFrom(observer$);
  }
}
