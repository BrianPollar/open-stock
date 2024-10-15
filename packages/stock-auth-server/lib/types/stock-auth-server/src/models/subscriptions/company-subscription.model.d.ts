/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { IcompanySubscription } from '@open-stock/stock-universal';
import { IcompanyIdAsObjectId } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model } from 'mongoose';
export type TcompanySubscription = Document & Omit<IcompanySubscription, 'companyId'> & IcompanyIdAsObjectId;
/**
 * Represents the main company subscription model.
 */
export declare let companySubscriptionMain: Model<TcompanySubscription>;
/**
 * Represents a lean company subscription model.
 */
export declare let companySubscriptionLean: Model<TcompanySubscription>;
/**
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
export declare const companySubscriptionSelect: {
    name: number;
    amount: number;
    duration: number;
    active: number;
    subscriprionId: number;
    startDate: number;
    endDate: number;
    pesaPalorderTrackingId: number;
    status: number;
    features: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates a new company subscription model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export declare const createCompanySubscription: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
