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
export declare const addCustomer: (req: any, res: any, next: any) => Promise<any>;
/**
   * Updates a customer by ID.
   * @name PUT /updateone/:companyIdParam
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {string} path - Express path
   * @param {callback} middleware - Express middleware
   * @returns {Promise} - Promise representing the update result
   */
export declare const updateCustomer: (req: any, res: any) => Promise<any>;
/**
 * Router for handling customer-related routes.
 */
export declare const customerRoutes: any;
