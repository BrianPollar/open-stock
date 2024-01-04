"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAuthClient = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
/**
 * StockAuthClient is a class that provides methods for authenticating with the stock service.
 */
class StockAuthClient {
    /**
     * Creates an instance of StockAuthClient.
     * @param axiosInstance An instance of Axios used for making HTTP requests.
     */
    constructor(axiosInstance) {
        StockAuthClient.ehttp = new stock_universal_1.EhttpController(axiosInstance);
    }
}
exports.StockAuthClient = StockAuthClient;
/**
 * logger: A static property of type LoggerController.
 * It is used for logging messages related to the stock authentication client.
 */
StockAuthClient.logger = new stock_universal_1.LoggerController();
//# sourceMappingURL=stock-auth-client.js.map