import {
  IcreateOrder,
  IdataArrayResponse, IdeleteCredentialsPayRel, IfilterProps, ImakeOrder,
  Iorder, Isuccess,
  IupdateOrder,
  TorderStatus
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { PaymentRelated } from './payment.define';

export class Order extends PaymentRelated {
  price: number;
  deliveryDate: Date;

  constructor(data: Required<Iorder>) {
    super(data);
    this.price = data.price;
    this.paymentMethod = data.paymentMethod;
    this.deliveryDate = data.deliveryDate;
    this.status = data.status ;
  }

  static async removeMany(credentials: IdeleteCredentialsPayRel[]) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/order/delete/many', { credentials });
    const deleted = await lastValueFrom(observer$);

    return deleted;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Required<Iorder>>>(`/order/all/${offset}/${limit}`);
    const orders = await lastValueFrom(observer$);

    return {
      count: orders.count,
      orders: orders.data.map(val => new Order(val)) };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Required<Iorder>>>('/order/filter', filter);
    const orders = await lastValueFrom(observer$);

    return {
      count: orders.count,
      orders: orders.data.map(val => new Order(val)) };
  }

  static async getOne(_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Required<Iorder>>(`/order/one/${_id}`);
    const order = await lastValueFrom(observer$);

    return new Order(order);
  }

  static directOrder(vals: ImakeOrder) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/order/makeorder', vals);

    return lastValueFrom(observer$);
  }

  static add(vals: IcreateOrder) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/order/add', vals);

    return lastValueFrom(observer$);
  }

  update(vals: IupdateOrder) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/order/update', vals);

    return lastValueFrom(observer$);
  }

  updateDeliveryStatus(status: TorderStatus) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(`/appendDelivery/${this._id}/${status}`, {});

    return lastValueFrom(observer$);
  }
}
