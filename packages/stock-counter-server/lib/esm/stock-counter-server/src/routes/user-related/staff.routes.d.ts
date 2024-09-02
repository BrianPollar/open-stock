/**
   * Adds a new staff member to the database.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next function.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
export declare const addStaff: (req: any, res: any, next: any) => Promise<any>;
/**
   * Updates a staff member.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
export declare const updateStaff: (req: any, res: any) => Promise<any>;
/**
 * Router for staff related routes.
 */
export declare const staffRoutes: any;
