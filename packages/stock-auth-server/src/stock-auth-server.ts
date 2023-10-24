import { runPassport } from "@open-stock/stock-universal-server";
import { EmailHandler } from "@open-stock/stock-notif-server";
import { authRoutes } from "./routes/auth.routes";
import { createEmailtokenModel } from "./models/emailtoken.model";
import { createUserModel, userLean } from "./models/user.model";

/** The  IlocalPath  interface defines the structure of the local file paths. */
export interface IlocalPath {
  absolutepath: string;
  photoDirectory: string;
  videoDirectory: string;
}

/** The  IaAuth  interface defines the structure of the admin authentication credentials. */
export interface IaAuth {
  processadminID: string;
  password: string;
};

/** The  IlAuth  interface defines the structure of the authentication secrets. */
export interface IlAuth {
  jwtSecret: string;
  cookieSecret: string;
};

/** The  IlocalEnv  interface defines the structure of the local environment settings. */
export interface IlocalEnv {
  production: boolean;
  appName: string;
  appOfficialName: string;
  websiteAddr1: string;
  websiteAddr2: string;
};

/** The  IStockAuthServerConfig  interface defines the structure of the server configuration.*/
export interface IStockAuthServerConfig {
  adminAuth: IaAuth;
  authSecrets: IlAuth;
  localSettings: IlocalEnv,
  databaseConfigUrl: string;
  localPath: IlocalPath;
}

/**The  StockAuthServer  class represents the stock authentication server and contains properties for admin authentication, authentication secrets, local environment settings, and an email handler. */
export class StockAuthServer {
  /**
   * Creates an instance of StockAuthServer.
   * @param {IaAuth} aAuth - The admin authentication credentials.
   * @param {IlAuth} lAuth - The authentication secrets.
   * @param {IlocalEnv} localEnv - The local environment settings.
   * @param {EmailHandler} locaLMailHandler - The email handler.
   * @memberof StockAuthServer
   */
  constructor(
    public aAuth: IaAuth,
    public lAuth: IlAuth,
    public localEnv: IlocalEnv,
    public locaLMailHandler: EmailHandler
    ) {}
}

/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export const connectAuthDatabase = async(databaseUrl: string): Promise<void> => {
  await createEmailtokenModel(databaseUrl);
  await createUserModel(databaseUrl); 
}

/** The  runStockAuthServer  function runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.*/
/**
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes: any, userLean: any}>}
 */
export const runStockAuthServer = async(config: IStockAuthServerConfig, emailHandler: EmailHandler, app: any): Promise<{authRoutes: any, userLean: any}> => {
  app.locals.authRoutes = true;
  Object.keys(config.localPath).forEach(key => {
    app.locals[key] = config.localPath[key];
  });

  const stockAuthServer = new StockAuthServer(
    config.adminAuth,
    config.authSecrets,
    config.localSettings,
    emailHandler
  )

  app.locals.stockAuthServer = stockAuthServer;

  // connect models
  await connectAuthDatabase(config.databaseConfigUrl);

  runPassport(stockAuthServer.lAuth.jwtSecret)
  return { authRoutes, userLean }
}
