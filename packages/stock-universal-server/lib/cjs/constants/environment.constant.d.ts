/**
 * Middleware function to retrieve environment variables and store them in the request object.
 * @param name - The name of the environment variable(s) to retrieve. Can be a string or an array of strings.
 * @returns A middleware function that sets the environment variables on the request object and calls the next middleware.
 */
export declare const getEnvVar: (name: string | string[]) => (req: any, res: any, next: any) => any;
/**
 * Retrieves the Express locals variable with the specified name.
 * @param app - The Express application instance.
 * @param name - The name of the Express locals variable to retrieve.
 * @returns The value of the Express locals variable.
 */
export declare const getExpressLocals: (app: any, name: string) => any;
