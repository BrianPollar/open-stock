"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthyTwilio = exports.runTwilio = exports.runAuthy = void 0;
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
const runAuthy = (authyKey) => authy(authyKey);
exports.runAuthy = runAuthy;
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
    authy: (0, exports.runAuthy)(authyKey),
    twilioClient: (0, exports.runTwilio)(accountSid, authToken)
});
exports.makeAuthyTwilio = makeAuthyTwilio;
//# sourceMappingURL=twilio.controller.js.map