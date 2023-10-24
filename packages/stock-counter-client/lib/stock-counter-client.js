import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { CalculationsController } from './controllers/calculations.controller';
export let stockCounterClient;
/** */
export class StockCounterClient {
    /** */
    constructor(axiosInstance) {
        StockCounterClient.ehttp = new EhttpController(axiosInstance);
    }
}
/** */
StockCounterClient.calcCtrl = new CalculationsController();
/** */
StockCounterClient.logger = new LoggerController();
/** */
export const createStockCounter = (axiosInstance) => {
    stockCounterClient = new StockCounterClient(axiosInstance);
    return { stockCounterClient };
};
//# sourceMappingURL=stock-counter-client.js.map