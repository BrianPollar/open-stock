"use strict";
/**
 * This module exports functions to create an Authy client, a Twilio client, and an object containing both clients.
 * @module twilioController
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTwilioService = exports.makeAuthyTwilio = exports.runTwilio = void 0;
const stock_notif_local_1 = require("../stock-notif-local");
// const authy = require('authy');
const twilioClient = require('twilio');
/**
 * Creates an Authy client
 * @param {string} authyKey - The Authy API key
 * @returns {Object} - The Authy client object
 */
// export const runAuthy = (authyKey: string) => authy(authyKey);
/**
 * Creates a Twilio client
 * @param {string} accountSid - The Twilio account SID
 * @param {string} authToken - The Twilio auth token
 * @returns {Object} - The Twilio client object
 */
const runTwilio = (accountSid, authToken) => twilioClient(accountSid, authToken);
exports.runTwilio = runTwilio;
/**
 * Creates an object containing an Authy client and a Twilio client
 * @param {string} authyKey - The Authy API key
 * @param {string} accountSid - The Twilio account SID
 * @param {string} authToken - The Twilio auth token
 * @returns {Object} - An object containing the Authy client and Twilio client
 */
const makeAuthyTwilio = (authyKey, accountSid, authToken) => ({
    // authy: runAuthy(authyKey),
    twilioClient: (0, exports.runTwilio)(accountSid, authToken)
});
exports.makeAuthyTwilio = makeAuthyTwilio;
const createTwilioService = () => {
    stock_notif_local_1.notificationSettings.twilioClient.verify.v2.services.create({ friendlyName: 'VerificationCode' })
        .then(service => service.sid);
};
exports.createTwilioService = createTwilioService;
//# sourceMappingURL=twilio.controller.js.map