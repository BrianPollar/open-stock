import { DatabaseAuto, IsubscriptionPackage } from '@open-stock/stock-universal';
export declare class SubscriptionPackange extends DatabaseAuto {
    name: string;
    ammount: number;
    duration: number;
    active: boolean;
    features: [];
    constructor(data: any);
    static getSubscriptionPackanges(): Promise<SubscriptionPackange[]>;
    static addSubscriptionPackage(subscriptionPackage: IsubscriptionPackage): Promise<unknown>;
    static deleteSubscriptionPackange(id: string): Promise<unknown>;
    updateSubscriptionPackage(subscriptionPackange: IsubscriptionPackage): Promise<unknown>;
}
