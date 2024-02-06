import { lastValueFrom } from 'rxjs';
import { PaymentRelated } from './payment.define';
import {
  IbagainCredential, IdeleteCredentialsPayRel, IinvoiceRelated,
  Iorder,
  Ipayment,
  IpaymentRelated,
  Isuccess,
  TorderStatus
} from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';


/**
 * Represents an order with payment and delivery information.
 * @extends PaymentRelated
 */
export class Order extends PaymentRelated {
  /** The initial price of the order. */
  price: number;

  /** The delivery date of the order. */
  deliveryDate: Date;

  /**
   * Creates a new Order instance.
   * @param data - The data to initialize the order with.
   */
  constructor(data: Required<Iorder>) {
    super(data);
    this.price = data.price;
    this.paymentMethod = data.paymentMethod;
    this.deliveryDate = data.deliveryDate;
    this.status = data.status ;
  }

  /**
   * Searches for orders based on a search term and key.
   * @param companyId - The ID of the company
   * @param searchterm - The search term to use.
   * @param searchKey - The search key to use.
   * @returns An array of orders that match the search criteria.
   */
  static async searchOrders(companyId: string, searchterm: string, searchKey: string) {
    const observer$ = StockCounterClient.ehttp.makePost(`/order/search/${companyId}`, { searchterm, searchKey });
    const orders = await lastValueFrom(observer$) as Required<Iorder>[];
    return orders.map(val => new Order(val));
  }

  /**
   * Deletes multiple orders.
   * @param companyId - The ID of the company
   * @param credentials - The credentials to use for authentication.
   * @returns An object indicating whether the deletion was successful.
   */
  static async deleteOrders(companyId: string, credentials: IdeleteCredentialsPayRel[]) {
    const observer$ = StockCounterClient.ehttp.makePut(`/order/deletemany/${companyId}`, { credentials });
    const deleted = await lastValueFrom(observer$) as Isuccess;
    return deleted;
  }

  /**
   * Gets a list of orders.
   * @param companyId - The ID of the company
   * @param url - The URL to use for the request.
   * @param offset - The offset to use for pagination.
   * @param limit - The limit to use for pagination.
   * @returns An array of orders.
   */
  static async getOrders(companyId: string, url = 'getall', offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/order/${url}/${offset}/${limit}/${companyId}`);
    const orders = await lastValueFrom(observer$) as Required<Iorder>[];
    return orders.map(val => new Order(val));
  }

  /**
   * Gets a single order by ID.
   * @param companyId - The ID of the company
   * @param id - The ID of the order to get.
   * @returns The order with the specified ID.
   */
  static async getOneOrder(companyId: string, id: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/order/getone/${id}`);
    const order = await lastValueFrom(observer$) as Required<Iorder>;
    return new Order(order);
  }

  /**
   * Creates a new order.
   * @param companyId - The ID of the company
   * @param paymentRelated - The payment related information for the order.
   * @param invoiceRelated - The invoice related information for the order.
   * @param order - The order information.
   * @param payment - The payment information.
   * @param bagainCred - The bagain credential information.
   * @param nonce - The nonce to use for the request.
   * @returns An object indicating whether the creation was successful.
   */
  static async makeOrder(
    companyId: string,
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated,
    order: Iorder,
    payment: Ipayment,
    bagainCred: IbagainCredential | null,
    nonce?
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/order/makeorder/${companyId}`, {
        paymentRelated,
        invoiceRelated,
        order,
        payment,
        bagainCred,
        nonce
      });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Creates a new order.
   * @param companyId - The ID of the company
   * @param paymentRelated - The payment related information for the order.
   * @param invoiceRelated - The invoice related information for the order.
   * @param order - The order information.
   * @param payment - The payment information.
   * @param bagainCred - The bagain credential information.
   * @param nonce - The nonce to use for the request.
   * @returns An object indicating whether the creation was successful.
   */
  static async createOrder(
    companyId: string,
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated,
    order: Iorder,
    payment: Ipayment,
    bagainCred: IbagainCredential | null,
    nonce?
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/order/create/${companyId}`, {
        paymentRelated,
        invoiceRelated,
        order,
        payment,
        bagainCred,
        nonce
      });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates the order with new information.
   * @param companyId - The ID of the company
   * @param updatedOrder - The updated order information.
   * @param paymentRelated - The updated payment related information.
   * @param invoiceRelated - The updated invoice related information.
   * @returns An object indicating whether the update was successful.
   */
  async updateOrder(
    companyId: string,
    updatedOrder: Iorder,
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/order/update/${companyId}`, { updatedOrder, paymentRelated, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Appends delivery information to the order.
   * @param companyId - The ID of the company
   * @param status - The status to append.
   * @returns An object indicating whether the operation was successful.
   */
  async appendDelivery(companyId: string, status: TorderStatus) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/appendDelivery/${this._id}/${status}`, {});
    return await lastValueFrom(observer$) as Isuccess;
  }
}
