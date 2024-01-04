import { EhttpController, LoggerController } from '@open-stock/stock-universal';
/**
 * StockNotifClient class is responsible for handling stock notifications.
 * It uses an instance of Axios to make HTTP requests and an instance of EhttpController to handle HTTP responses.
 */
export class StockNotifClient {
    /**
     * Creates an instance of StockNotifClient.
     * @param {Axios} axiosInstance - An instance of Axios to make HTTP requests.
     */
    constructor(axiosInstance) {
        StockNotifClient.ehttp = new EhttpController(axiosInstance);
    }
}
StockNotifClient.logger = new LoggerController();
//# sourceMappingURL=stock-notif-client.js.map