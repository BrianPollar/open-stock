import { isNotificationsServerRunning } from '@open-stock/stock-notif-server';
import { IstrategyCred, runPassport, stockUniversalConfig } from '@open-stock/stock-universal-server';
import express from 'express';
import { ConnectOptions } from 'mongoose';
import { PesaPalController } from 'pesapal3';
import { companyRoutes } from './routes/company.routes';
import { companySubscriptionRoutes } from './routes/subscriptions/company-subscription.routes';
import { superAdminRoutes } from './routes/superadmin.routes';
import { userAuthRoutes } from './routes/user.routes';
import {
  connectDatabase, createStockAuthServerLocals, isStockAuthServerRunning, stockAuthConfig
} from './stock-auth-local';

/**
 * Represents the interface for local file paths.
 */
export interface IlocalPath {
  absolutepath: string;
  photoDirectory: string;
  videoDirectory: string;
}

/**
 * Represents the authentication information for an admin user.
 */
export interface IaAuth {
  processadminID: string;
  password: string;
}


/**
 * Represents the local environment configuration.
 */
export interface IlocalEnv {
  production: boolean;
  appName: string;
  appOfficialName: string;
  websiteAddr1: string;
  websiteAddr2: string;
}

/**
 * Represents the configuration for the Stock Auth Server.
 */
export interface IStockAuthServerConfig {
  adminAuth: IaAuth;
  localSettings: IlocalEnv;
  databaseConfig: {
    url: string;
    dbOptions?: ConnectOptions;
  };
  localPath: IlocalPath;
  permanentlyDeleteAfter: number; // defaults to 0
  socialAuthStrategys?: IstrategyCred;
}

/**
 * The PesaPal payment instance for the server.
 */
export let pesapalPaymentInstance: PesaPalController;

/**
 * The URL to redirect to when a notification is received.
 */
export let notifRedirectUrl: string;


/**
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database,
 *  initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes, userLean}>}
 */
export const runStockAuthServer = async(
  config: IStockAuthServerConfig,
  paymentInstance: PesaPalController
) => {
  if (!isNotificationsServerRunning()) {
    const error = new Error('Notifications server is not running, please start by firing up that server');

    throw error;
  }

  pesapalPaymentInstance = paymentInstance;
  createStockAuthServerLocals(config);
  // connect models
  await connectDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);
  runPassport(stockUniversalConfig.authSecrets.jwtSecret, config.socialAuthStrategys);
  const stockAuthRouter = express.Router();

  stockAuthRouter.use('/user', userAuthRoutes);
  stockAuthRouter.use('/company', companyRoutes);
  stockAuthRouter.use('/companysubscription', companySubscriptionRoutes);
  stockAuthRouter.use('/admin', superAdminRoutes);

  return { stockAuthRouter };
};

/**
 * Checks if the stock authentication server is running.
 * @returns {boolean} True if the server is running, false otherwise.
 */
export const isAuthServerRunning = () => isStockAuthServerRunning;

/**
 * Retrieves the stock auth configuration.
 * @returns The stock auth configuration.
 */
export const getStockAuthConfig = () => stockAuthConfig;
