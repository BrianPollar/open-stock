import { EhttpController } from './utils/ehttp';
/**
 * Represents the configuration options for the app.
 */
// export interface IappConfig {
/**
   * The base URL of the server.
   */
// baseServerUrl: string;
/**
   * The token used to authenticate requests.
   */
// token?: string;
// }
/**
 * Represents a StockUniversal class.
 */
export class StockUniversal {
    /**
     * Creates an instance of StockUniversal.
     * @param environment - The environment configuration object.
     */
    constructor(environment, axiosInstance) {
        StockUniversal.environment = environment;
        StockUniversal.ehttp = new EhttpController(axiosInstance);
    }
}
//# sourceMappingURL=stock-universal.js.map