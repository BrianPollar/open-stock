import { IenvironmentConfig } from '@open-stock/stock-universal';
import { ConnectOptions } from 'mongoose';
import {
  connectUniversalDatabase, createStockUniversalServerLocals, isStockUniversalServerRunning
} from './stock-universal-local';
// const colors = require('colors');
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { apiRouter } from './utils/expressrouter';
import { hasValidIdsInRequest, isDocDeleted, trackRoutes, trackUser } from './utils/track';

const logger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = path.join(process.cwd() + '/openstockLog/');

    fs.mkdir(logDir, { recursive: true }, (err) => {
      if (err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('data.output err ', err);
        }
      }
    });
    fs.appendFile(logDir + '/universal-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

/**
 * Represents the configuration options for the stock-auth-server.
 */
export interface IlAuth {
  jwtSecret: string;
  cookieSecret: string;
}

export interface IStockUniversalServerConfig {
  authSecrets: IlAuth;
  envCfig: IenvironmentConfig;
  trackUsers?: boolean;
  expireDocAfterSeconds?: number;
  databaseConfig: {
    url: string;
    dbOptions?: ConnectOptions;
  };
}

/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
export const runStockUniversalServer = async(config: IStockUniversalServerConfig) => {
  logger.info('Starting the application...');
  logger.trace('Starting the application...');
  logger.debug('Starting the application...');
  logger.error('Starting the application...');


  apiRouter.use(hasValidIdsInRequest);
  apiRouter.use(isDocDeleted);
  const stockUniversalRouter = express.Router();

  stockUniversalRouter.use('/track', trackRoutes);

  apiRouter.use(trackUser);

  createStockUniversalServerLocals(config);
  // connect models
  await connectUniversalDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);

  return Promise.resolve({ isStockUniversalServerRunning, stockUniversalRouter });
};

/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
export const isUniversalServerRunning = () => isStockUniversalServerRunning;
