/**
 * Validates a phone number.
 * @param value - The phone number to validate.
 * @returns An object containing the validation result.
 */
export const validatePhone = (value) => {
    if (isNaN(value)) {
        return {
            valid: false,
            message: 'not a number'
        };
    }
    if (value % 1 !== 0) {
        return {
            valid: false,
            message: 'not a whole number'
        };
    }
    if (value.length < 7) {
        return {
            valid: false,
            message: 'less than 7'
        };
    }
    if (value.length > 15) {
        return {
            valid: false,
            message: 'more than 15'
        };
    }
    return {
        valid: true,
        message: 'correct number format'
    };
};
//# sourceMappingURL=phone-validator.js.map