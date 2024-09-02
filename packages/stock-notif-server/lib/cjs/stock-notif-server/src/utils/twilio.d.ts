/**
 * This module exports functions to create an Authy client, a Twilio client, and an object containing both clients.
 * @module twilioController
 */
/**
 * Creates an Authy client
 * @param {string} authyKey - The Authy API key
 * @returns {Object} - The Authy client object
 */
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
    twilioClient: any;
};
/**
 * Creates a Twilio Verify service with the friendly name "VerificationCode".
 * @returns {Promise<string>} - A promise that resolves to the SID of the created service.
 */
export declare const createTwilioService: () => void;
