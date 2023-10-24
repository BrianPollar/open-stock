const authy = require('authy');
const twilioClient = require('twilio');
/** */
export const runAuthy = (authyKey) => authy(authyKey);
/** */
export const runTwilio = (accountSid, authToken) => twilioClient(accountSid, authToken);
/** */
export const makeAuthyTwilio = (authyKey, accountSid, authToken) => ({
    authy: runAuthy(authyKey),
    twilioClient: runTwilio(accountSid, authToken)
});
//# sourceMappingURL=twilio.controller.js.map