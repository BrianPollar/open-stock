/**
 * Checks if the IP address is valid and attempts to log in the user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The next middleware function or an error response.
 */
export declare const checkIpAndAttempt: (req: any, res: any, next: any) => Promise<any>;
/**
 * Checks if the provided password is a common phrase.
 * If the password is found in the common phrase data, it sends a response indicating that the password is too easy.
 * Otherwise, it calls the next middleware function.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const isTooCommonPhrase: (req: any, res: any, next: any) => any;
/**
 * Checks if the provided password is found in a common dictionary online.
 * If the password is found, it sends a response indicating that the password should be changed.
 * Otherwise, it proceeds to the next middleware.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const isInAdictionaryOnline: (req: any, res: any, next: any) => any;
/**
 * Determines if the provided string is a phone number or an email address and creates a filter object accordingly.
 * @param emailPhone - The string to be checked.
 * @returns An object containing the query and a flag indicating if the string is a phone number.
 */
export declare const determineIfIsPhoneAndMakeFilterObj: (emailPhone: string) => {
    query: {
        email: string;
        phone?: undefined;
    };
    isPhone: boolean;
} | {
    query: {
        phone: string;
        email?: undefined;
    };
    isPhone: boolean;
};
/**
 * Handles the login and registration process for users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves to void.
 */
export declare const loginFactorRelgator: (req: any, res: any, next: any) => Promise<any>;
/**
 * Resets the account password based on the provided verification code and new password.
 * @param req - The request object containing the request body.
 * @param res - The response object used to send the response.
 * @returns The response object with the updated account password.
 */
export declare const resetAccountFactory: (req: any, res: any) => Promise<any>;
/**
 * Recovers the user account by sending a token via email or phone.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response containing the success status and error message (if applicable).
 */
export declare const recoverAccountFactory: (req: any, res: any) => Promise<any>;
/**
 * Handles the confirmation of a user account.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with the status and response data.
 */
export declare const confirmAccountFactory: (req: any, res: any) => Promise<any>;
