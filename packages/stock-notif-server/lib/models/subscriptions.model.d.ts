import { Document, Model } from 'mongoose';
/** model interface for notification by*/
/** */
export interface ISubscription extends Document {
    subscription: any;
    userId: string;
}
/** main connection for notifications Operations*/
export declare let subscriptionMain: Model<ISubscription>;
/** lean connection for notifications Operations*/
export declare let subscriptionLean: Model<ISubscription>;
/** primary selection object
 * for notification
 */
/** */
export declare const subscriptionSelect: {
    subscription: number;
    userId: number;
};
/** */
export declare const createSubscriptionModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
