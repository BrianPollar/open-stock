/**
 * @fileoverview This file contains the definition of the notification settings model.
 * @packageDocumentation
 */
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
import { InotifSetting } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents the type for a notification setting.
 * Extends the Document interface and the InotifSetting interface.
 */
export type TnotifSetting = Document & InotifSetting;
/**
 * Represents the main notification setting model.
 */
export declare let notifSettingMain: Model<TnotifSetting>;
/**
 * Represents a variable that holds a lean model of a notification setting.
 */
export declare let notifSettingLean: Model<TnotifSetting>;
/**
 * Selects the notifSettingselect constant from the notifSetting model.
 */
export declare const notifSettingSelect: {
    companyId: number;
    invoices: number;
    payments: number;
    orders: number;
    jobCards: number;
    users: number;
};
/**
 * Creates the notification settings model.
 * @async
 * @param {string} dbUrl - The database URL.
 * @param {boolean} [main=true] - Whether to create the main connection.
 * @param {boolean} [lean=true] - Whether to create the lean connection.
 */
export declare const createNotifStnModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
