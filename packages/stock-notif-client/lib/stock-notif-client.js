import { EhttpController, LoggerController } from '@open-stock/stock-universal';
/** */
export class StockNotifClient {
    constructor(axiosInstance) {
        StockNotifClient.ehttp = new EhttpController(axiosInstance);
    }
}
StockNotifClient.logger = new LoggerController();
//# sourceMappingURL=stock-notif-client.js.map