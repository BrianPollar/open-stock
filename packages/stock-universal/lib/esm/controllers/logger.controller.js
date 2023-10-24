/* eslint-disable @typescript-eslint/no-unsafe-return */
// This file imports the `debug` module.
import debug from 'debug';
// The constant `APP_NAME` defines the name of the application.
const APP_NAME = 'OPEN-STOCK';
// The following line is commented out because it is not safe to modify `localStorage` directly.
// eslint-disable-next-line @typescript-eslint/dot-notation
// localStorage['debug'] = 'for:* stock-counter:*';
// This class is a logger controller.
/** */
export class LoggerController {
    // The constructor for the class.
    constructor() {
        // The private property `pDebug` is a debug logger.
        this.pDebug = debug(`${APP_NAME}:DEBUG`);
        // The private property `pWarn` is a warning logger.
        this.pWarn = debug(`${APP_NAME}:WARN`);
        // The private property `pError` is an error logger.
        this.pError = debug(`${APP_NAME}:ERROR`);
        // The private property `pTrace` is a trace logger.
        this.pTrace = debug(`${APP_NAME}:TRACE`);
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
    // The getter for the `debug` property.
    get debug() {
        return this.pDebug;
    }
    // The getter for the `warn` property.
    get warn() {
        return this.pWarn;
    }
    // The getter for the `error` property.
    get error() {
        return this.pError;
    }
    // The getter for the `trace` property.
    get trace() {
        return this.pTrace;
    }
}
//# sourceMappingURL=logger.controller.js.map