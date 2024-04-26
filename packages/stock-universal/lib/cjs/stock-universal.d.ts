/**
 * Represents the configuration for the database.
 */
/**
   * The URL of the database.
   */
/**
 * Represents the configuration for the environment.
 */
export interface IenvironmentConfig {
    /**
     * The name of the application.
     */
    appName: string;
    /**
     * The directory where photos are stored relative to absolutepath.
     */
    photoDirectory: string;
    /**
     * The directory where videos are stored relative absolutepath.
     */
    videoDirectory: string;
    /**
     * The absolute path to the application directory.
     */
    absolutepath: string;
}
/**
 * Represents the configuration options for the app.
 */
/**
   * The base URL of the server.
   */
/**
   * The token used to authenticate requests.
   */
/**
 * Represents a StockUniversal class.
 */
export declare class StockUniversal {
    /**
     * The environment configuration.
     */
    static environment: IenvironmentConfig;
    /**
     * Creates an instance of StockUniversal.
     * @param environment - The environment configuration object.
     */
    constructor(environment: IenvironmentConfig);
}
