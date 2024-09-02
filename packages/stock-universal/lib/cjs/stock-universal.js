"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockUniversal = void 0;
const ehttp_1 = require("./utils/ehttp");
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
class StockUniversal {
    /**
     * Creates an instance of StockUniversal.
     * @param environment - The environment configuration object.
     */
    constructor(environment, axiosInstance) {
        StockUniversal.environment = environment;
        StockUniversal.ehttp = new ehttp_1.EhttpController(axiosInstance);
    }
}
exports.StockUniversal = StockUniversal;
//# sourceMappingURL=stock-universal.js.map