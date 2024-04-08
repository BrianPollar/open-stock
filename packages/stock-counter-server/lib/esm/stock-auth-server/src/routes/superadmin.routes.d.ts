/**
 * Router for super admin routes.
 */
export declare const superAdminRoutes: any;
/**
 * Handles the login and registration process for superadmin users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to void.
 */
export declare const signupFactorRelgator: (req: any, res: any, next: any) => Promise<any>;
export declare const requireSuperAdmin: (req: any, res: any, next: any) => any;
