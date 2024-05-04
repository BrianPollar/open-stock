import { IenvironmentConfig } from '@open-stock/stock-universal';
import { ConnectOptions } from 'mongoose';
import { connectUniversalDatabase, createStockUniversalServerLocals, isStockUniversalServerRunning } from './stock-universal-local';
// const colors = require('colors');
import * as tracer from 'tracer';
import * as fs from 'fs';

const logger = tracer.colorConsole(
  {
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
      // eslint-disable-next-line no-console
      console.log(data.output);
      const logDir = './openstockLog/';
      fs.mkdir(logDir, { recursive: true }, (err) => {
        if (err) {
          if (err) {
            throw err;
          }
        }
      });
      fs.appendFile('./openStockLog/universal-server.log', data.rawoutput + '\n', err => {
        if (err) {
          throw err;
        }
      });
    }
  });


/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
export const runStockUniversalServer = async(envCfig: IenvironmentConfig, databaseConfigUrl: string, dbOptions?: ConnectOptions) => {
  logger.info('Starting the application...');
  logger.trace('Starting the application...');
  logger.debug('Starting the application...');
  logger.error('Starting the application...');

  createStockUniversalServerLocals(envCfig);
  // connect models
  await connectUniversalDatabase(databaseConfigUrl, dbOptions);
  return Promise.resolve({ isStockUniversalServerRunning });
};

/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
export const isUniversalServerRunning = () => isStockUniversalServerRunning;
