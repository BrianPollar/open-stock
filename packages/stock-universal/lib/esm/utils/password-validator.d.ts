import { IvalidatorResult } from '../types/validators-types';
/**
 * Validates if two passwords match.
 * @param password - The first password to compare.
 * @param otherPassword - The second password to compare.
 * @returns An object containing the validation result.
 */
export declare const validatePasswordMatch: (password: string, otherPassword: string) => IvalidatorResult;
