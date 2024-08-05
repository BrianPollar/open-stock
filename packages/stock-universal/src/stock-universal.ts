
/**
 * Represents the configuration for the database.
 */
// export interface IdatabaseConfig {
/**
   * The URL of the database.
   */
// url: string;
// }

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
   * The environment configuration.
   */
  static environment: IenvironmentConfig;

  /**
   * Creates an instance of StockUniversal.
   * @param environment - The environment configuration object.
   */
  constructor(environment: IenvironmentConfig) {
    StockUniversal.environment = environment;
  }
}
