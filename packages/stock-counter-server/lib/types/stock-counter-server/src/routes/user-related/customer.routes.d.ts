import { IcustomRequest, IeditCustomer } from '@open-stock/stock-universal';
import express, { NextFunction, Response } from 'express';
/**
   * Adds a new customer to the database.
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @param {NextFunction} next - The express next function.
   * @returns {Promise} - Promise representing the saved customer
   */
export declare const addCustomer: (req: IcustomRequest<never, IeditCustomer>, res: Response, next: NextFunction) => Promise<void | express.Response<any, Record<string, any>>>;
/**
   * Updates a customer by ID.
   * @name PUT /updateone
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {string} path - Express path
   * @param {callback} middleware - Express middleware
   * @returns {Promise} - Promise representing the update result
   */
export declare const updateCustomer: (req: IcustomRequest<never, IeditCustomer>, res: any) => Promise<any>;
/**
 * Router for handling customer-related routes.
 */
export declare const customerRoutes: import("express-serve-static-core").Router;
