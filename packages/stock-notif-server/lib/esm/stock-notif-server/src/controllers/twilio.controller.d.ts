/**
 * Creates an Authy client
 * @param {string} authyKey - The Authy API key
 * @returns {Object} - The Authy client object
 */
export declare const runAuthy: (authyKey: string) => any;
/**
 * Creates a Twilio client
 * @param {string} accountSid - The Twilio account SID
 * @param {string} authToken - The Twilio auth token
 * @returns {Object} - The Twilio client object
 */
export declare const runTwilio: (accountSid: string, authToken: string) => any;
/**
 * Creates an object containing an Authy client and a Twilio client
 * @param {string} authyKey - The Authy API key
 * @param {string} accountSid - The Twilio account SID
 * @param {string} authToken - The Twilio auth token
 * @returns {Object} - An object containing the Authy client and Twilio client
 */
export declare const makeAuthyTwilio: (authyKey: string, accountSid: string, authToken: string) => {
    authy: any;
    twilioClient: any;
};
