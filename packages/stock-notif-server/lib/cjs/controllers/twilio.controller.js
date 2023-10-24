"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthyTwilio = exports.runTwilio = exports.runAuthy = void 0;
const authy = require('authy');
const twilioClient = require('twilio');
/** */
const runAuthy = (authyKey) => authy(authyKey);
exports.runAuthy = runAuthy;
/** */
const runTwilio = (accountSid, authToken) => twilioClient(accountSid, authToken);
exports.runTwilio = runTwilio;
/** */
const makeAuthyTwilio = (authyKey, accountSid, authToken) => ({
    authy: (0, exports.runAuthy)(authyKey),
    twilioClient: (0, exports.runTwilio)(accountSid, authToken)
});
exports.makeAuthyTwilio = makeAuthyTwilio;
//# sourceMappingURL=twilio.controller.js.map