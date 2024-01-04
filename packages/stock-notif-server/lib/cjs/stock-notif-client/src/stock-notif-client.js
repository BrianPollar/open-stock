"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockNotifClient = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
/**
 * StockNotifClient class is responsible for handling stock notifications.
 * It uses an instance of Axios to make HTTP requests and an instance of EhttpController to handle HTTP responses.
 */
class StockNotifClient {
    /**
     * Creates an instance of StockNotifClient.
     * @param {Axios} axiosInstance - An instance of Axios to make HTTP requests.
     */
    constructor(axiosInstance) {
        StockNotifClient.ehttp = new stock_universal_1.EhttpController(axiosInstance);
    }
}
exports.StockNotifClient = StockNotifClient;
StockNotifClient.logger = new stock_universal_1.LoggerController();
//# sourceMappingURL=stock-notif-client.js.map