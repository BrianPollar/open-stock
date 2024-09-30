import { Isuccess } from '@open-stock/stock-universal';
/**
   * A pre middleware hook that sets expireDocAfter to null if the
   *  doc is not deleted, and sets it to the current date if the doc is deleted.
   * @param {Object} queryThis - The document being updated.
   * @param {Function} next - The next middleware function.
   */
export declare const preUpdateDocExpire: (queryThis: any, next: any) => void;
/**
   * A function that takes a password string and returns a promise that
   * resolves to an object with a boolean success key and an optional hash key.
   * The hash key is set to the hashed password if the password is valid, otherwise
   * the success key is set to false and the err key is set to the error.
   * @param {string} password - The password to hash.
   * @returns {Promise<Isuccess & { hash?: string; err? }>} - A promise that
   * resolves to an object with a boolean success key and an optional hash key.
   */
export declare const preSavePassword: (password: string) => Promise<Isuccess & {
    hash?: string;
    err?;
}>;
