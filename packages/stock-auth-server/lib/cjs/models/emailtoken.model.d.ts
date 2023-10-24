import { Document, Model } from 'mongoose';
/** a bunch of email tokens sent to users */
/** */
export interface IEmailtoken extends Document {
    userId: string;
    token: string;
    updatedAt: string;
    createdAt: string;
}
export declare let emailtoken: Model<IEmailtoken>;
export declare let emailtokenLean: Model<IEmailtoken>;
/** */
export declare const createEmailtokenModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
