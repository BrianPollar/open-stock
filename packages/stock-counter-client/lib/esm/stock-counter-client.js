import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { CalculationsController } from './controllers/calculations.controller';
export let stockCounterClient;
export class StockCounterClient {
    /**
     * Creates an instance of the StockCounterClient class.
     * @param axiosInstance The Axios instance to be used for HTTP requests.
     */
    constructor(axiosInstance) {
        StockCounterClient.ehttp = new EhttpController(axiosInstance);
    }
}
StockCounterClient.calcCtrl = new CalculationsController();
StockCounterClient.logger = new LoggerController();
/**
 * Creates a stock counter client.
 * @param axiosInstance - The Axios instance to use for HTTP requests.
 * @returns An object containing the stock counter client.
 */
export const createStockCounter = (axiosInstance) => {
    stockCounterClient = new StockCounterClient(axiosInstance);
    return { stockCounterClient };
};
//# sourceMappingURL=stock-counter-client.js.map