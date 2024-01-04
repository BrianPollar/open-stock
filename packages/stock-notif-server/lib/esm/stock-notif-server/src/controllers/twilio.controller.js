/**
 * This module exports functions to create an Authy client, a Twilio client, and an object containing both clients.
 * @module twilioController
 */
const authy = require('authy');
const twilioClient = require('twilio');
/**
 * Creates an Authy client
 * @param {string} authyKey - The Authy API key
 * @returns {Object} - The Authy client object
 */
export const runAuthy = (authyKey) => authy(authyKey);
/**
 * Creates a Twilio client
 * @param {string} accountSid - The Twilio account SID
 * @param {string} authToken - The Twilio auth token
 * @returns {Object} - The Twilio client object
 */
export const runTwilio = (accountSid, authToken) => twilioClient(accountSid, authToken);
/**
 * Creates an object containing an Authy client and a Twilio client
 * @param {string} authyKey - The Authy API key
 * @param {string} accountSid - The Twilio account SID
 * @param {string} authToken - The Twilio auth token
 * @returns {Object} - An object containing the Authy client and Twilio client
 */
export const makeAuthyTwilio = (authyKey, accountSid, authToken) => ({
    authy: runAuthy(authyKey),
    twilioClient: runTwilio(accountSid, authToken)
});
//# sourceMappingURL=twilio.controller.js.map