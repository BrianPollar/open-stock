import { IlAuth } from '@open-stock/stock-auth-server';
import { PesaPalController } from 'pesapal3';
import { EmailHandler } from '@open-stock/stock-notif-server';
/** */
export interface IlocalPath {
    absolutepath: string;
    photoDirectory: string;
    videoDirectory: string;
}
/** */
export interface IstockcounterServerConfig {
    authSecrets: IlAuth;
    databaseConfigUrl: string;
    notifRedirectUrl: string;
    localPath: IlocalPath;
}
export declare let pesapalPaymentInstance: PesaPalController;
/** */
export declare const connectStockCounterDatabase: (databaseUrl: string) => Promise<[void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void]>;
/** */
export declare const runStockCounterServer: (config: IstockcounterServerConfig, paymentInstance: PesaPalController, emailHandler: EmailHandler, app: any) => Promise<any>;
