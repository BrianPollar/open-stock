/**
 * Validates if two passwords match.
 * @param password - The first password to compare.
 * @param otherPassword - The second password to compare.
 * @returns An object containing the validation result.
 */
export const validatePasswordMatch = (password, otherPassword) => {
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
//# sourceMappingURL=password-validator.js.map