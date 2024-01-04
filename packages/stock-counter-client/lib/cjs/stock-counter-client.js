"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockCounter = exports.StockCounterClient = exports.stockCounterClient = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const calculations_controller_1 = require("./controllers/calculations.controller");
class StockCounterClient {
    /**
     * Creates an instance of the StockCounterClient class.
     * @param axiosInstance The Axios instance to be used for HTTP requests.
     */
    constructor(axiosInstance) {
        StockCounterClient.ehttp = new stock_universal_1.EhttpController(axiosInstance);
    }
}
exports.StockCounterClient = StockCounterClient;
StockCounterClient.calcCtrl = new calculations_controller_1.CalculationsController();
StockCounterClient.logger = new stock_universal_1.LoggerController();
/**
 * Creates a stock counter client.
 * @param axiosInstance - The Axios instance to use for HTTP requests.
 * @returns An object containing the stock counter client.
 */
const createStockCounter = (axiosInstance) => {
    exports.stockCounterClient = new StockCounterClient(axiosInstance);
    return { stockCounterClient: exports.stockCounterClient };
};
exports.createStockCounter = createStockCounter;
//# sourceMappingURL=stock-counter-client.js.map