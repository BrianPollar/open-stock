/**
 * Middleware function to retrieve environment variables and store them in the request object.
 * @param name - The name of the environment variable(s) to retrieve. Can be a string or an array of strings.
 * @returns A middleware function that sets the environment variables on the request object and calls the next middleware.
 */
export const getEnvVar = (name: string | string[]) => (req, res, next) => {
  // If `name` is a string, then push it onto an empty array.
  // Otherwise, just use the `name` array as-is.
  let productArr = [];
  if (typeof name === 'string') {
    productArr.push(name);
  } else {
    productArr = name.slice();
  }

  // Create a new object to store the environment variables.
  const localEnv = req.env || {};

  // Iterate over the `productArr` array and set the corresponding environment variable on the `localEnv` object.
  productArr.reduce((acc, name) => {
    if (acc[name]) {
      acc[name] = process.env[name];
      return acc;
    }
    return {
      ...acc,
      [name]: process.env[name]
    };
  }, localEnv);

  // Set the `localEnv` object on the request object.
  req.localEnv = localEnv;

  // Return the next middleware function.
  return next();
};

/**
 * Retrieves the Express locals variable with the specified name.
 * @param app - The Express application instance.
 * @param name - The name of the Express locals variable to retrieve.
 * @returns The value of the Express locals variable.
 */
export const getExpressLocals = (app, name: string) => {
  // Return the Express locals variable named `name`.
  return app.locals[name];
};
