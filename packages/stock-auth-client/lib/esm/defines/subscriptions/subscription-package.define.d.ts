import { DatabaseAuto, IsubscriptionPackage, Isuccess } from '@open-stock/stock-universal';
import { IsubscriptionFeature } from '@open-stock/stock-universal';
export declare class SubscriptionPackange extends DatabaseAuto {
    name: string;
    ammount: number;
    duration: number;
    active: boolean;
    features: IsubscriptionFeature[];
    constructor(data: any);
    static getSubscriptionPackanges(): Promise<SubscriptionPackange[]>;
    static addSubscriptionPackage(subscriptionPackage: IsubscriptionPackage): Promise<Isuccess>;
    static deleteSubscriptionPackange(id: string): Promise<Isuccess>;
    updateSubscriptionPackage(subscriptionPackange: IsubscriptionPackage): Promise<Isuccess>;
}
