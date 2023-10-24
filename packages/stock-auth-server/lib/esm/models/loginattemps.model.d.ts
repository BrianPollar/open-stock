import { Document, Model } from 'mongoose';
/** a bunch of email tokens sent to users */
/** */
export interface IloginAttempts extends Document {
    userId: string;
    ip: string;
    successful: boolean;
    updatedAt: string;
    createdAt: string;
}
export declare let loginAtempts: Model<IloginAttempts>;
export declare let loginAtemptsLean: Model<IloginAttempts>;
/** */
export declare const createLoginAtemptsModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
