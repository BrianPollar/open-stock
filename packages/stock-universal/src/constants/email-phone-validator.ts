import { IvalidatorResult } from '../interfaces/validators.interface';
import { validateEmail } from './email-validator';
import { validatePhone } from './phone-validator';

/**
 * Validates an email or phone number.
 * If the value is not a number, it validates the email.
 * If the value is a number, it validates the phone number.
 * @param value - The value to be validated.
 * @returns The validation result.
 */
export const emailphoneValidator = (value): IvalidatorResult => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isNaN(value)) {
    return validateEmail(value);
  } else {
    return validatePhone(value);
  }
};

