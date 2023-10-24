import { EhttpController, LoggerController } from '@open-stock/stock-universal';
/** This is a class definition for  StockAuthClient  that is exported. It represents a client for authenticating with a stock service.  */
/** */
export class StockAuthClient {
    /** constructor : A constructor method that initializes the  ehttp property with an instance of  EhttpController. It takes an  axiosInstance  parameter, which is an instance of Axios used for making HTTP requests. */
    constructor(axiosInstance) {
        StockAuthClient.ehttp = new EhttpController(axiosInstance);
    }
}
/** logger : A static property of type  LoggerController . It is used for logging messages related to the stock authentication client. */
StockAuthClient.logger = new LoggerController();
//# sourceMappingURL=stock-auth-client.js.map