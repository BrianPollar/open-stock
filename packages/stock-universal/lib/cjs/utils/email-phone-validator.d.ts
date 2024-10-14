import { IvalidatorResult } from '../types/validators-types';
/**
 * Validates an email or phone number.
 * If the value is not a number, it validates the email.
 * If the value is a number, it validates the phone number.
 * @param value - The value to be validated.
 * @returns The validation result.
 */
export declare const emailphoneValidator: (value: any) => IvalidatorResult;
