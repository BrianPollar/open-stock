import { ConnectOptions } from 'mongoose';
import { InotifSecrets, ItwilioAuthySecrets } from './stock-notif-local';
export interface IstockNotifServerConfig {
    jwtSecret: string;
    databaseConfig: {
        url: string;
        dbOptions?: ConnectOptions;
    };
    twilioAutyConfig: ItwilioAuthySecrets;
    notifSecrets: InotifSecrets;
    useDummyRoutes?: boolean;
}
export declare const createService: () => void;
export declare const runStockNotificationServer: (config: IstockNotifServerConfig) => Promise<{
    stockNotifRouter: any;
    notificationSettings: import("./stock-notif-local").InotificationConfig;
}>;
/**
 * Retrieves the current notification settings.
 * @returns {Promise<TnotifSetting>} A promise that resolves to the current notification settings.
 */
export declare const getCurrentNotificationSettings: (companyId: string) => Promise<{}>;
/**
 * Checks if the notifications server is running.
 * @returns {boolean} True if the notifications server is running, false otherwise.
 */
export declare const isNotificationsServerRunning: () => boolean;
