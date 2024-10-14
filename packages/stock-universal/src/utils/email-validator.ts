import { IvalidatorResult } from '../types/validators-types';

/**
 * Validates an email address.
 * @param value - The email address to validate.
 * @returns An object containing the validation result.
 */
export const validateEmail = (value: string): IvalidatorResult => {
  const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(value);

  return {
    valid: re,
    message: re ? 'valid email' : 'invalid email'
  };
};
