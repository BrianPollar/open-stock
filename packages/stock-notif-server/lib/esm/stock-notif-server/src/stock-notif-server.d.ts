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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { ItwilioAuthySecrets } from './stock-notif-local';
export interface IstockNotifServerConfig {
    jwtSecret: string;
    databaseConfigUrl: string;
    twilioAutyConfig: ItwilioAuthySecrets;
    useDummyRoutes?: boolean;
}
export declare const runStockNotificationServer: (config: IstockNotifServerConfig) => Promise<{
    stockNotifRouter: any;
    notificationSettings: import("./stock-notif-local").InotificationConfig;
}>;
/**
 * Retrieves the current notification settings.
 * @returns {Promise<TnotifSetting>} A promise that resolves to the current notification settings.
 */
export declare const getCurrentNotificationSettings: () => Promise<import("mongoose").FlattenMaps<import("./models/notifsetting.model").TnotifSetting> & {
    _id: import("mongoose").Types.ObjectId;
}>;
/**
 * Checks if the notifications server is running.
 * @returns {boolean} True if the notifications server is running, false otherwise.
 */
export declare const isNotificationsServerRunning: () => boolean;
