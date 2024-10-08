"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-return */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerController = void 0;
const tslib_1 = require("tslib");
// This file imports the `debug` module.
const debug_1 = tslib_1.__importDefault(require("debug"));
// The constant `APP_NAME` defines the name of the application.
const APP_NAME = 'OPEN-STOCK';
// The following line is commented out because it is not safe to modify `localStorage` directly.
// eslint-disable-next-line @typescript-eslint/dot-notation
// localStorage['debug'] = 'for:* stock-counter:*';
// localStorage['debug'] = 'OPEN-STOCK:*';
// This class is a logger controller.
/**
 * The LoggerController class provides logging functionality for the application.
 */
class LoggerController {
    /**
     * The constructor for the LoggerController class.
     * Sets the logging functions for the private properties and the colors for the logs.
     */
    constructor() {
        // The private property `pDebug` is a debug logger.
        this.pDebug = (0, debug_1.default)(`${APP_NAME}:DEBUG`);
        // The private property `pWarn` is a warning logger.
        this.pWarn = (0, debug_1.default)(`${APP_NAME}:WARN`);
        // The private property `pError` is an error logger.
        this.pError = (0, debug_1.default)(`${APP_NAME}:ERROR`);
        // The private property `pTrace` is a trace logger.
        this.pTrace = (0, debug_1.default)(`${APP_NAME}:TRACE`);
        // Set the logging functions for the private properties.
        this.pDebug.log = console.info.bind(console);
        this.pWarn.log = console.warn.bind(console);
        this.pError.log = console.error.bind(console);
        this.pTrace.log = console.trace.bind(console);
        // Set the colors for the logs.
        this.pDebug.color = 'blue';
        this.pWarn.color = 'yellow';
        this.pError.color = 'red';
        this.pTrace.color = 'pink';
    }
    /**
     * The getter for the `debug` property.
     * @returns The debug logger.
     */
    get debug() {
        return this.pDebug;
    }
    /**
     * The getter for the `warn` property.
     * @returns The warning logger.
     */
    get warn() {
        return this.pWarn;
    }
    /**
     * The getter for the `error` property.
     * @returns The error logger.
     */
    get error() {
        return this.pError;
    }
    /**
     * The getter for the `trace` property.
     * @returns The trace logger.
     */
    get trace() {
        return this.pTrace;
    }
}
exports.LoggerController = LoggerController;
//# sourceMappingURL=logger.js.map