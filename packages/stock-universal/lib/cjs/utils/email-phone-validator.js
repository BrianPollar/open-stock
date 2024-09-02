"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailphoneValidator = void 0;
const email_validator_1 = require("./email-validator");
const phone_validator_1 = require("./phone-validator");
/**
 * Validates an email or phone number.
 * If the value is not a number, it validates the email.
 * If the value is a number, it validates the phone number.
 * @param value - The value to be validated.
 * @returns The validation result.
 */
const emailphoneValidator = (value) => {
    if (isNaN(value)) {
        return (0, email_validator_1.validateEmail)(value);
    }
    else {
        return (0, phone_validator_1.validatePhone)(value);
    }
};
exports.emailphoneValidator = emailphoneValidator;
//# sourceMappingURL=email-phone-validator.js.map