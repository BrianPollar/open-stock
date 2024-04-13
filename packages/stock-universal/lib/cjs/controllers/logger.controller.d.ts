/**
 * The LoggerController class provides logging functionality for the application.
 */
export declare class LoggerController {
    appName: string;
    private pDebug;
    private pWarn;
    private pError;
    private pTrace;
    /**
     * The constructor for the LoggerController class.
     * Sets the logging functions for the private properties and the colors for the logs.
     */
    constructor(appName?: string);
    /**
     * The getter for the `debug` property.
     * @returns The debug logger.
     */
    get debug(): any;
    /**
     * The getter for the `warn` property.
     * @returns The warning logger.
     */
    get warn(): any;
    /**
     * The getter for the `error` property.
     * @returns The error logger.
     */
    get error(): any;
    /**
     * The getter for the `trace` property.
     * @returns The trace logger.
     */
    get trace(): any;
}
