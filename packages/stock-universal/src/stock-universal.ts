/** */
export interface IdatabaseConfig {
  // The `url` property is the URL of the database.
  url: string;
}

// This interface defines the properties of the database configuration.

/** */
export interface IenvironmentConfig {
  // The `appName` property is the name of the application.
  appName: string;
  // The `photoDirectory` property is the directory where photos are stored.
  photoDirectory: string;
  // The `videoDirectory` property is the directory where videos are stored.
  videoDirectory: string;
  // The `absolutepath` property is the absolute path to the application directory.
  absolutepath: string;
}

// This interface defines the properties of the environment configuration.

/** */
export interface IappConfig {
  // The `baseServerUrl` property is the base URL of the server.
  baseServerUrl: string;
  // The `token` property is the token used to authenticate requests.
  token?: string;
}

// This interface defines the properties of the application configuration.

/** */
export class StockUniversal {
  // The `environment` property is the environment configuration.
  static environment: IenvironmentConfig;

  // The constructor takes an environment configuration object as input.
  constructor(
    environment: IenvironmentConfig
  ) {
    // The `environment` property is set to the input object.
    StockUniversal.environment = environment;
  }
}

// This class is the main entry point for the application.
