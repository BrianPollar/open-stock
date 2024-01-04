"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = void 0;
/**
 * Validates an email address.
 * @param value - The email address to validate.
 * @returns An object containing the validation result.
 */
const validateEmail = (value) => {
    const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(value);
    return {
        valid: re,
        message: re ? 'valid email' : 'invalid email'
    };
};
exports.validateEmail = validateEmail;
//# sourceMappingURL=email-validator.js.map