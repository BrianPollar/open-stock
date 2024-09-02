import { IvalidatorResult } from '../interfaces/validators.interface';

/**
 * Validates if two passwords match.
 * @param password - The first password to compare.
 * @param otherPassword - The second password to compare.
 * @returns An object containing the validation result.
 */
export const validatePasswordMatch = (
  password: string,
  otherPassword: string
): IvalidatorResult => {
  if (password !== otherPassword) {
    return {
      valid: false,
      message: 'passwords did not match'
    };
  } else {
    return {
      valid: true,
      message: 'passwords match'
    };
  }
};
