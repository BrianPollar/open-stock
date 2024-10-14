import { Error } from 'mongoose';
import { mainLogger } from './back-logger';

/**
 * Converts a Mongoose error object into a string representation.
 * @param errors - The Mongoose error object.
 * @returns A string representation of the Mongoose errors.
 */
export const stringifyMongooseErr = (errors: object): string => {
  mainLogger.info('stringifyMongooseErr', errors);
  const errorsStrArr = Object.keys(errors).map(key => {
    let err = '';

    if (errors[key].kind === 'unique') {
      err = errors[key].message;
    } else {
      err = key + ' ' + errors[key].message;
    }

    return err;
  });

  return errorsStrArr.join(', ');
};

export const handleMongooseErr = (error: Error) => {
  mainLogger.info('handleMongooseErr', error);
  let err: string;

  if (error instanceof Error.ValidationError) {
    err = stringifyMongooseErr(error.errors);
  } else {
    err = `we are having problems connecting to our databases, 
    try again in a while`;
  }

  return { success: false, status: 403, err };
};
