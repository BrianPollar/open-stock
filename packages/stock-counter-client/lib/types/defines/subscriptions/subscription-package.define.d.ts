import { Isuccess } from '@open-stock/stock-universal';
export declare class SubscriptionPackange {
    name: string;
    ammount: number;
    duration: number;
    active: boolean;
    features: [];
    constructor(data: any);
    static getSubscriptionPackanges(): Promise<SubscriptionPackange[]>;
    static addSubscriptionPackange(companyId: string, subscriptionPackages: any): Promise<Isuccess>;
    static deleteSubscriptionPackange(id: string): Promise<Isuccess>;
}
