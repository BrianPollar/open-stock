import { EmailHandler, SmsHandler } from './controllers/notifications.controller';
/** */
export interface IlocalPath {
    absolutepath: string;
    photoDirectory: string;
    videoDirectory: string;
}
/** */
export interface InotifConfig {
    publicKey: string;
    privateKey: string;
    redirectUrl: string;
}
/** */
export interface IlAuth {
    jwtSecret: string;
    cookieSecret: string;
}
/** */
export interface ItwilioAuthyConfig {
    secret: string;
    accountSid: string;
    authToken: string;
    twilioNumber: string;
    authyKey: string;
    enableValidationSMS: string;
    sendGridApiKey: string;
}
export declare let smsHandler: SmsHandler;
export declare let emailHandler: EmailHandler;
/** */
export interface IstocknotifServerConfig {
    authSecrets: IlAuth;
    notificationsSettings: InotifConfig;
    twilioAuthySetings: ItwilioAuthyConfig;
    databaseConfigUrl: string;
    localPath: IlocalPath;
}
/** */
export declare const createNotificationsDatabase: (databaseUrl: any) => Promise<[void, void, void]>;
/** */
export declare const runStockNotificationServer: (config: IstocknotifServerConfig, app: any) => Promise<any>;
