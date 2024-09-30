import { IcreateOrder, IdeleteCredentialsPayRel, IfilterProps, ImakeOrder, Iorder, Isuccess, IupdateOrder, TorderStatus } from '@open-stock/stock-universal';
import { PaymentRelated } from './payment.define';
export declare class Order extends PaymentRelated {
    price: number;
    deliveryDate: Date;
    constructor(data: Required<Iorder>);
    static removeMany(credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        orders: Order[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        orders: Order[];
    }>;
    static getOne(_id: string): Promise<Order>;
    static directOrder(vals: ImakeOrder): Promise<Isuccess>;
    static add(vals: IcreateOrder): Promise<Isuccess>;
    update(vals: IupdateOrder): Promise<Isuccess>;
    updateDeliveryStatus(status: TorderStatus): Promise<Isuccess>;
}
