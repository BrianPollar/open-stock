"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordMatch = void 0;
/**
 * Validates if two passwords match.
 * @param password - The first password to compare.
 * @param otherPassword - The second password to compare.
 * @returns An object containing the validation result.
 */
const validatePasswordMatch = (password, otherPassword) => {
    if (password !== otherPassword) {
        return {
            valid: false,
            message: 'passwords did not match'
        };
    }
    else {
        return {
            valid: true,
            message: 'passwords match'
        };
    }
};
exports.validatePasswordMatch = validatePasswordMatch;
//# sourceMappingURL=password-validator.js.map