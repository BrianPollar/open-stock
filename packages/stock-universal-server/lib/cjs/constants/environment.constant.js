"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpressLocals = exports.getEnvVar = void 0;
// This function gets the environment variable named `name` and sets it on the request object.
// If `name` is an array of strings, then the function gets all of the environment variables in the array and sets them on the request object.
/** */
const getEnvVar = (name) => (req, res, next) => {
    // If `name` is a string, then push it onto an empty array.
    // Otherwise, just use the `name` array as-is.
    let productArr = [];
    if (typeof name === 'string') {
        productArr.push(name);
    }
    else {
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
exports.getEnvVar = getEnvVar;
// This function gets the Express locals variable named `name`.
/** */
const getExpressLocals = (app, name) => {
    // Return the Express locals variable named `name`.
    return app.locals[name];
};
exports.getExpressLocals = getExpressLocals;
//# sourceMappingURL=environment.constant.js.map